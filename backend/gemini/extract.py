import os
import json
import logging
from typing import Dict, Any
from google.genai import types
from gemini.client import get_client, call_with_retry, MODEL_NAME, MOCK_MODE
from gemini.cache import get_cached_bill, set_cached_bill, get_cached_nameplate, set_cached_nameplate
from gemini.validate import validate_bill, validate_nameplate, GeminiValidationError
from schemas import BillData, NameplateData

logger = logging.getLogger(__name__)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

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
        "You are extracting data from an Indian electricity bill (TNEB / Tamil Nadu).\n"
        "Return ONLY the fields defined in the schema.\n"
        "If a field is not clearly visible, return null for that field.\n"
        "Do NOT estimate, infer, or calculate any value that is not printed on the bill.\n"
        "If the image is too blurry to read the units consumed, set units_consumed to null.\n\n"
        "PRIVACY: Do NOT extract or return the consumer name, consumer number,\n"
        "service address, phone number, or email. These are not needed."
    )

    try:
        def api_call():
            contents = [
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt
            ]
            return client.models.generate_content(
                model=MODEL_NAME,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=BillData,
                )
            )

        response = call_with_retry(api_call)
        parsed_data = json.loads(response.text)
    except Exception as e:
        logger.error(f"Gemini bill extraction or JSON parsing failed: {e}")
        raise GeminiValidationError(
            reason="OCR_BLUR",
            message="Couldn't read the units. Try a clearer photo of the whole bill."
        )

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
        def api_call():
            contents = [
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt
            ]
            return client.models.generate_content(
                model=MODEL_NAME,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=NameplateData,
                )
            )

        response = call_with_retry(api_call)
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
