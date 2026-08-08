import io
import os
import json
import logging
from typing import Dict, Any, Optional
from google.genai import types
from gemini.client import (
    get_client,
    call_with_fallback,
    generate,
    MODEL_NAME,
    MOCK_MODE,
)
from gemini.cache import get_cached_bill, set_cached_bill, get_cached_nameplate, set_cached_nameplate
from gemini.validate import validate_bill, validate_nameplate, GeminiValidationError
from gemini.schemas import BillExtraction, NameplateExtraction

logger = logging.getLogger(__name__)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Fields without which the engine cannot run. Used to decide whether a first
# extraction pass failed badly enough to be worth retrying at other rotations.
REQUIRED_FIELDS = ("units_consumed", "total_amount")
ROTATIONS = (90, 180, 270)


def _count_required(parsed: Dict[str, Any]) -> int:
    """How many required fields came back with a usable value."""
    n = 0
    for f in REQUIRED_FIELDS:
        v = parsed.get(f)
        if v is None:
            continue
        try:
            if float(v) != 0:
                n += 1
        except (ValueError, TypeError):
            pass
    return n


def _count_all(parsed: Dict[str, Any]) -> int:
    return sum(1 for v in parsed.values() if v is not None)


def _rotate(image_bytes: bytes, degrees: int) -> Optional[bytes]:
    from PIL import Image
    buf = io.BytesIO()
    Image.open(io.BytesIO(image_bytes)).rotate(degrees, expand=True).convert("RGB").save(
        buf, format="JPEG", quality=92
    )
    return buf.getvalue()


def _extract_best_orientation(image_bytes, mime_type, run_once, parsed):
    """Retries extraction at other rotations when the first pass came back
    mostly empty, and keeps whichever orientation read the most.

    A real handheld photo of a bill arrived rotated 90 degrees and lost
    units_consumed entirely; upright, the same image read it every time.

    Triggered when ANY required field is missing, not only when both are. The
    real failure had exactly one missing — total_amount read fine, units did
    not — so a both-missing threshold would never have fired on the very bug
    this exists to fix. There is no latency downside: a first pass missing any
    required field is already guaranteed to be rejected by validate_bill, so
    the retries only ever run on requests that would otherwise have failed.
    A cleanly oriented photo has both fields and returns here immediately.
    """
    if _count_required(parsed) == len(REQUIRED_FIELDS):
        return parsed, 0
    # Not a bill at all — no orientation will make it one, so fail fast rather
    # than spending three more API calls confirming it.
    if parsed.get("is_electricity_bill") is False:
        logger.info("Auto-rotation skipped: image is not an electricity bill.")
        return parsed, 0

    best, best_deg = parsed, 0
    for degrees in ROTATIONS:
        try:
            rotated = _rotate(image_bytes, degrees)
        except Exception as e:
            logger.warning(f"Could not rotate image by {degrees} degrees ({e}). Skipping rotation retry.")
            break
        try:
            candidate = run_once(rotated, "image/jpeg")
        except Exception as e:
            logger.warning(f"Extraction at {degrees} degrees failed ({e}).")
            continue

        better = (_count_required(candidate), _count_all(candidate)) > (
            _count_required(best), _count_all(best)
        )
        if better:
            best, best_deg = candidate, degrees
        if _count_required(candidate) == len(REQUIRED_FIELDS):
            break  # nothing left to gain

    if best_deg:
        logger.info(f"Auto-rotation: image read best at {best_deg} degrees.")
    return best, best_deg

def load_mock_file(filename: str) -> Dict[str, Any]:
    mock_path = os.path.join(BASE_DIR, "mocks", filename)
    with open(mock_path, "r", encoding="utf-8") as f:
        return json.load(f)


def extract_bill(image_bytes: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    """Extracts TNEB bill data from image bytes using Gemini structured outputs."""
    if MOCK_MODE:
        logger.info("MOCK_MODE: Returning mock bill extraction data.")
        return load_mock_file("extract_bill.json")

    # Check cache first
    cached = get_cached_bill(image_bytes)
    if cached is not None:
        return cached

    client = get_client()
    if client is None:
        raise GeminiValidationError("SERVER_ERROR", "Gemini client not initialized.")

    prompt = (
        "You are extracting data from an Indian electricity bill (TNEB / Tamil Nadu).\n\n"
        "FIRST, set is_electricity_bill:\n"
        "  true  - the image is an electricity bill, a payment receipt for one,\n"
        "          or a bill-like document with printed charge details.\n"
        "  false - the image is blank or featureless, a photo of an unrelated\n"
        "          object, a person, a screen, a wall, or anything with no\n"
        "          bill-like structure at all.\n"
        "If is_electricity_bill is false, set EVERY other field to null. Do not\n"
        "supply numbers for an image that is not a bill. Returning a plausible\n"
        "number for a blank or unrelated image is the single worst thing you can\n"
        "do here - null is always the correct answer when there is nothing to read.\n\n"
        "THEN extract the fields defined in the schema.\n"
        "If a field is not clearly visible, return null for that field.\n"
        "Do NOT estimate, infer, or calculate any value that is not printed on the bill.\n"
        "If the image is too blurry to read the units consumed, set units_consumed to null.\n\n"
        "PRIVACY: Do NOT extract or return the consumer name, consumer number,\n"
        "service address, phone number, or email. These are not needed."
    )

    def run_once(data: bytes, mime: str) -> Dict[str, Any]:
        def api_call(model: str):
            contents = [types.Part.from_bytes(data=data, mime_type=mime), prompt]
            return generate(client, model, contents, response_schema=BillExtraction)

        return json.loads(call_with_fallback(api_call).text)

    try:
        parsed_data = run_once(image_bytes, mime_type)
    except Exception as e:
        logger.error(f"Gemini bill extraction or JSON parsing failed: {e}")
        raise GeminiValidationError(
            reason="OCR_BLUR",
            message="Couldn't read the units. Try a clearer photo of the whole bill."
        )

    parsed_data, _ = _extract_best_orientation(image_bytes, mime_type, run_once, parsed_data)

    # Validate and normalize
    validated_data = validate_bill(parsed_data)
    
    # Set cache
    set_cached_bill(image_bytes, validated_data)
    return validated_data


def extract_nameplate(image_bytes: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    """Extracts appliance specification label details using Gemini structured outputs."""
    if MOCK_MODE:
        logger.info("MOCK_MODE: Returning mock nameplate extraction data.")
        return load_mock_file("extract_nameplate.json")

    # Check cache first
    cached = get_cached_nameplate(image_bytes)
    if cached is not None:
        return cached

    client = get_client()
    if client is None:
        return load_mock_file("extract_nameplate.json")

    prompt = (
        "You are reading the specification label on an Indian household appliance.\n"
        "Return ONLY the fields defined in the schema. Use null for anything unclear.\n"
        "Do NOT guess a value that is not printed.\n\n"
        "- appliance_type: one of ac, fridge, geyser, washing_machine, fan, tv,\n"
        "  lights, motor_pump. If it is not one of these, return null.\n"
        "- rated_power_w: the wattage. If only amps and volts are printed, return null\n"
        "  (do NOT multiply — we do not know the power factor).\n"
        "- star_rating: the BEE star count, 1-5.\n"
        "- capacity: tons for AC (e.g. 1.5), litres for fridge/geyser.\n"
        "- manufacture_year: 4-digit year if printed anywhere on the label."
    )

    try:
        def api_call(model: str):
            contents = [
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt
            ]
            return generate(client, model, contents, response_schema=NameplateExtraction)

        response = call_with_fallback(api_call)
        parsed_data = json.loads(response.text)
    except Exception as e:
        logger.error(f"Gemini nameplate extraction or JSON parsing failed: {e}")
        # For nameplate, failures are soft. We return a schema-compliant empty nameplate.
        parsed_data = {
            "appliance_type": "ac",
            "rated_power_w": None,
            "star_rating": None,
            "capacity": None,
            "manufacture_year": None
        }

    # Validate and normalize (soft: fields are set to null on out of range)
    validated_data = validate_nameplate(parsed_data)
    
    # Set cache
    set_cached_nameplate(image_bytes, validated_data)
    return validated_data
