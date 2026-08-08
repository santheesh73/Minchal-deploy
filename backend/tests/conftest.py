import os
import sys

# The test suite must never touch the network. MOCK_MODE is decided at import
# time from GEMINI_API_KEY, and main.py calls load_dotenv() on import — which
# would pick the real key out of backend/.env and make the API tests fire live
# requests (and fail on quota). Setting the var to empty here wins: load_dotenv
# does not override keys already present in os.environ, and an empty string is
# falsy, so MOCK_MODE stays True.
#
# Tests that exercise the real code path patch MOCK_MODE to False explicitly.
os.environ["GEMINI_API_KEY"] = ""

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
