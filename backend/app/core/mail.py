"""SMTP z TLS; konfiguracja i hasła pozostają w prywatnym środowisku."""
import asyncio
import os
import smtplib
import ssl
from email.message import EmailMessage
from fastapi import HTTPException


def smtp_config():
    values = {key: os.getenv("SMTP_" + key, "") for key in ("HOST", "USER", "PASSWORD", "FROM")}
    if not all(values.values()):
        raise HTTPException(503, "Email delivery is not configured")
    return values


async def send_code(recipient, code, purpose, language):
    config = smtp_config()
    def deliver():
        message = EmailMessage()
        message["From"], message["To"] = config["FROM"], recipient
        polish = language == "pl"
        action = ("Reset hasła" if purpose == "reset" else "Weryfikacja konta") if polish else (
            "Password reset" if purpose == "reset" else "Account verification")
        message["Subject"] = f"Queue System — {action}"
        message.set_content(f"{action}\n\nKod: {code}\nWażny przez 10 minut. Jeśli nie wysłano prośby, zignoruj tę wiadomość."
                            if polish else f"{action}\n\nCode: {code}\nValid for 10 minutes. Ignore this message if you did not request it.")
        mode = os.getenv("SMTP_SECURITY", "starttls")
        if mode not in ("starttls", "ssl"):
            raise ValueError("SMTP requires TLS")
        port = int(os.getenv("SMTP_PORT", "465" if mode == "ssl" else "587"))
        context = ssl.create_default_context()
        server = smtplib.SMTP_SSL(config["HOST"], port, timeout=15, context=context) if mode == "ssl" else smtplib.SMTP(config["HOST"], port, timeout=15)
        with server:
            if mode == "starttls":
                server.starttls(context=context)
            server.login(config["USER"], config["PASSWORD"])
            server.send_message(message)
    try:
        await asyncio.to_thread(deliver)
    except (OSError, smtplib.SMTPException, ValueError):
        raise HTTPException(503, "Email delivery failed; please retry later") from None
