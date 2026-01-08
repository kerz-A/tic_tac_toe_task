import os
import random
import string
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

app = Flask(__name__)


def send_telegram_message(text: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("Telegram env vars not set, message:", text)
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": text}
    try:
        r = requests.post(url, json=payload, timeout=5)
        print("TG RESPONSE:", r.status_code, r.text)
    except Exception as e:
        print("Error sending Telegram message:", e)


def generate_promo_code(length: int = 5) -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/result", methods=["POST"])
def result():
    data = request.get_json()
    outcome = data.get("outcome")  # "win" | "lose" | "draw"

    if outcome == "win":
        promo = generate_promo_code()
        msg = f"Победа! Промокод выдан: {promo}"
        send_telegram_message(msg)
        return jsonify({"status": "ok", "promo": promo})
    elif outcome == "lose":
        send_telegram_message("Проигрыш")
        return jsonify({"status": "ok"})
    else:
        return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
