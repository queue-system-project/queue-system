"""Twilio Verify: ograniczony czas połączenia i rozróżnienie błędu kodu od awarii."""
import asyncio
import os
import re

from fastapi import HTTPException
from twilio.base.exceptions import TwilioRestException
from twilio.http.http_client import TwilioHttpClient
from twilio.rest import Client


def sms_config():
    values = tuple(os.getenv(key) for key in (
        "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_VERIFY_SERVICE_SID"))
    if not all(values):
        raise HTTPException(503, "SMS service is not configured")
    return values


def service():
    account, token, sid = sms_config()
    return Client(account, token, http_client=TwilioHttpClient(timeout=10)).verify.v2.services(sid)


async def send_code(recipient, code, purpose, language="en"):
    # Obecny zakres wdrożenia obejmuje wyłącznie polskie numery.
    if not re.fullmatch(r"\+48[0-9]{9}", recipient):
        raise HTTPException(422, "SMS verification supports Polish numbers in +48 format")
    def send():
        api = service()
        # Nie wysyłamy kodu, którego czterocyfrowy formularz nie przyjmie.
        if api.fetch().code_length != 4:
            raise HTTPException(503, "SMS service must use four-digit codes")
        return api.verifications.create(to=recipient, channel="sms", locale=language).sid
    try:
        # Synchroniczny SDK nie blokuje pętli obsługującej HTTP i WebSocket.
        return await asyncio.to_thread(send)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(503, "SMS delivery failed; please retry later") from None


async def cancel_code(verification_sid):
    # Zmiana celu lub ponowne wysłanie unieważnia poprzednią weryfikację.
    try:
        await asyncio.to_thread(lambda: service().verifications(verification_sid).update(status="canceled"))
    except TwilioRestException as error:
        if error.status != 404:
            raise HTTPException(503, "SMS service unavailable; please retry later") from None
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(503, "SMS service unavailable; please retry later") from None


async def check_code(verification_sid, code):
    try:
        result = await asyncio.to_thread(lambda: service().verification_checks.create(
            verification_sid=verification_sid, code=code))
        return result.status == "approved"
    except TwilioRestException as error:
        if error.status == 404 or error.code == 60202:
            return False
        # Awaria lub limit dostawcy nie zużywa lokalnej próby użytkownika.
        raise HTTPException(503, "SMS service unavailable; please retry later") from None
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(503, "SMS service unavailable; please retry later") from None
