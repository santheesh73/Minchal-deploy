import logging
from typing import List, Dict, Any
from gemini.client import (
    get_client,
    call_with_fallback,
    generate,
    MODEL_NAME,
    MOCK_MODE,
)

logger = logging.getLogger(__name__)

def generate_explanation(bill: Any, breakdown: List[Dict[str, Any]], actions: List[Dict[str, Any]], language: str = "en") -> str:
    """Generates natural language explanation from raw parameters. Falls back to a template on error."""
    bill_units = getattr(bill, "units_consumed", None)
    if bill_units is None and isinstance(bill, dict):
        bill_units = bill.get("units_consumed")
        
    bill_total = getattr(bill, "total_amount", None)
    if bill_total is None and isinstance(bill, dict):
        bill_total = bill.get("total_amount")

    bill_days = getattr(bill, "billing_days", None)
    if bill_days is None and isinstance(bill, dict):
        bill_days = bill.get("billing_days")

    top_appliance = breakdown[0]["label"] if breakdown else "சாதனம்"
    top_action_text = actions[0]["text"] if actions else "பயன்பாட்டைக் குறைக்கவும்"
    savings_val = actions[0]["saves_rupees"] if actions else 0.0

    # Fallback template definition
    if language == "ta":
        fallback_text = (
            f"உங்கள் மின் நுகர்வு {bill_units} யூனிட்கள், மொத்த மதிப்பு ரூ. {bill_total}. "
            f"இதில் {top_appliance} அதிக மின்சாரத்தைப் பயன்படுத்துகிறது. "
            f"சேமிப்பிற்காக, {top_action_text} பரிந்துரைக்கிறோம் (மாதாந்திர சேமிப்பு சுமார் ரூ. {savings_val})."
        )
    else:
        fallback_text = (
            f"Your electricity consumption is {bill_units} units, totalling Rs {bill_total}. "
            f"{top_appliance} is your largest contributor. "
            f"We recommend you {top_action_text} to save approximately Rs {savings_val} per month."
        )

    if MOCK_MODE:
        logger.info("MOCK_MODE: Returning fallback template explanation.")
        return fallback_text

    try:
        client = get_client()
        if client is None:
            logger.info("No Gemini client found. Returning fallback explanation.")
            return fallback_text

        # Construct breakdown string
        items_strs = []
        for item in breakdown:
            items_strs.append(f"{item['label']}: Rs {item['rupees']} ({item['percent']}%)")
        breakdown_str = ", ".join(items_strs)

        # Construct prompt
        lang_name = "Tamil" if language == "ta" else "English"
        prompt = (
            f"Write a short explanation in {lang_name} using ONLY these numbers:\n\n"
            f"Bill total: Rs {bill_total} for {bill_units} units over {bill_days} days.\n"
            f"Breakdown: {breakdown_str}\n"
            f"Top action: {top_action_text}, saving about Rs {savings_val}/month.\n\n"
            "Rules:\n"
            "- Do NOT introduce any number that is not listed above.\n"
            "- Do NOT round differently than given.\n"
            "- Name the single largest consumer in the first sentence.\n"
            "- 2 short sentences, then 1 recommendation sentence.\n"
            f"- Plain conversational {lang_name}. No technical jargon.\n"
            f"- Output MUST be in {lang_name}."
        )

        def api_call(model: str):
            return generate(client, model, prompt)

        response = call_with_fallback(api_call)
        if response.text and response.text.strip():
            res_text = response.text.strip()
            if language != "ta" and any("\u0b80" <= ch <= "\u0bff" for ch in res_text):
                logger.warning("Gemini returned Tamil text when English was requested. Falling back to English template.")
                return fallback_text
            return res_text
    except Exception as e:
        logger.error(f"Gemini explanation generation failed: {e}. Falling back to template.")

    return fallback_text

