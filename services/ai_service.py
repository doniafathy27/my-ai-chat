import requests

from config import HF_TOKEN, MODEL, HF_API_URL


def get_ai_response(messages):

    if not HF_TOKEN:
        return {
            "success": False,
            "message": "API token is missing. Please configure HF_TOKEN."
        }

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }

    data = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": 500
    }

    try:

        response = requests.post(
            HF_API_URL,
            headers=headers,
            json=data,
            timeout=60
        )

        if response.ok:

            result = response.json()

            ai_message = result["choices"][0]["message"]["content"]

            return {
                "success": True,
                "message": ai_message
            }

        return {
            "success": False,
            "message": "The AI service is currently unavailable."
        }

    except requests.exceptions.Timeout:

        return {
            "success": False,
            "message": "The request timed out. Please try again."
        }

    except requests.exceptions.RequestException:

        return {
            "success": False,
            "message": "Could not connect to the AI service."
        }

    except Exception:

        return {
            "success": False,
            "message": "Something went wrong. Please try again."
        }