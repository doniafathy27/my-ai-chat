from flask import Flask, request, jsonify, render_template

from services.ai_service import get_ai_response


app = Flask(__name__)


@app.route("/")
def home():

    return render_template("chat.html")


@app.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()

    messages = data.get("messages", [])

    if not messages:

        return jsonify({
            "success": False,
            "message": "No messages were provided."
        }), 400

    result = get_ai_response(messages)

    return jsonify(result)


if __name__ == "__main__":

    app.run(debug=True)