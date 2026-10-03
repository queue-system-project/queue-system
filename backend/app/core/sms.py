import os

from fastapi import HTTPException
from twilio.rest import Client


def sms_config():
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    verify_service_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")

    if not account_sid or not auth_token or not verify_service_sid:
        raise HTTPException(
            status_code=503,
            detail="SMS service is not configured",
        )

    return account_sid, auth_token, verify_service_sid


async def send_code(recipient, code, purpose, language="en"):
    account_sid, auth_token, verify_service_sid = sms_config()

    try:
        client = Client(account_sid, auth_token)

        verification = (
            client.verify.v2
            .services(verify_service_sid)
            .verifications
            .create(
                to=recipient,
                channel="sms",
            )
        )

        return verification.sid

    except Exception as e:
        print("TWILIO VERIFY ERROR:", repr(e))

        raise HTTPException(
            status_code=503,
            detail="SMS delivery failed; please retry later",
        )

async def check_code(recipient, code):
    account_sid, auth_token, verify_service_sid = sms_config()

    try:
        client = Client(account_sid, auth_token)

        verification_check = (
            client.verify.v2
            .services(verify_service_sid)
            .verification_checks
            .create(
                to=recipient,
                code=code,
            )
        )

        return verification_check.status == "approved"

    except Exception as e:
        print("TWILIO VERIFY CHECK ERROR:", repr(e))
        return False