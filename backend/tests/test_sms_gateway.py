"""Kontrakt adaptera Twilio bez połączeń sieciowych."""
import asyncio
import threading
from types import SimpleNamespace
import pytest
from fastapi import HTTPException
from twilio.base.exceptions import TwilioRestException
from app.core import sms


class Service:
    def __init__(self, code_length=4, error=None):
        self.code_length, self.error = code_length, error
        self.calls = []
        self.verifications = self
        self.verification_checks = self
    def fetch(self):
        return self
    def __call__(self, sid):
        self.calls.append(("sid", sid))
        return self
    def update(self, **kwargs):
        if self.error:
            raise self.error
        self.calls.append(("update", kwargs))
    def create(self, **kwargs):
        if self.error:
            raise self.error
        self.calls.append((threading.get_ident(), kwargs))
        return SimpleNamespace(sid="VE" + "1" * 32, status="approved")


def test_send_uses_four_digit_service_polish_number_and_worker_thread(monkeypatch):
    api = Service()
    monkeypatch.setattr(sms, "service", lambda: api)
    assert asyncio.run(sms.send_code("+48500100200", None, "verify", "pl")) == "VE" + "1" * 32
    thread, args = api.calls[0]
    assert thread != threading.get_ident()
    assert args == {"to": "+48500100200", "channel": "sms", "locale": "pl"}


@pytest.mark.parametrize("length", [6, None])
def test_wrong_service_code_length_stops_before_sending(monkeypatch, length):
    api = Service(length)
    monkeypatch.setattr(sms, "service", lambda: api)
    with pytest.raises(HTTPException) as error:
        asyncio.run(sms.send_code("+48500100200", None, "verify"))
    assert error.value.status_code == 503 and not api.calls


def test_non_polish_number_stops_before_provider_call(monkeypatch):
    def forbidden():
        pytest.fail("Nie wolno wywołać dostawcy")
    monkeypatch.setattr(sms, "service", forbidden)
    with pytest.raises(HTTPException) as error:
        asyncio.run(sms.send_code("+49123456789", None, "verify"))
    assert error.value.status_code == 422


def test_check_uses_verification_sid_instead_of_phone(monkeypatch):
    api = Service()
    monkeypatch.setattr(sms, "service", lambda: api)
    assert asyncio.run(sms.check_code("VE" + "1" * 32, "1234"))
    assert api.calls[0][1] == {"verification_sid": "VE" + "1" * 32, "code": "1234"}


@pytest.mark.parametrize("status,code,invalid", [(404, 20404, True), (429, 60202, True),
    (401, 20003, False), (429, 20429, False), (500, 20500, False)])
def test_provider_errors_are_not_all_wrong_codes(monkeypatch, status, code, invalid):
    api = Service(error=TwilioRestException(status, "/test", msg="private provider detail", code=code))
    monkeypatch.setattr(sms, "service", lambda: api)
    if invalid:
        assert asyncio.run(sms.check_code("VE" + "1" * 32, "1234")) is False
    else:
        with pytest.raises(HTTPException) as error:
            asyncio.run(sms.check_code("VE" + "1" * 32, "1234"))
        assert error.value.status_code == 503
        assert "private" not in error.value.detail


def test_cancel_ignores_already_consumed_verification(monkeypatch):
    api = Service(error=TwilioRestException(404, "/test", code=20404))
    monkeypatch.setattr(sms, "service", lambda: api)
    asyncio.run(sms.cancel_code("VE" + "1" * 32))


def test_missing_configuration_does_not_create_client(monkeypatch):
    for key in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_VERIFY_SERVICE_SID"):
        monkeypatch.delenv(key, raising=False)
    with pytest.raises(HTTPException) as error:
        sms.service()
    assert error.value.status_code == 503


def test_client_has_bounded_network_timeout(monkeypatch):
    for key in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_VERIFY_SERVICE_SID"):
        monkeypatch.setenv(key, "test-only")
    calls = []
    def client(account, token, http_client):
        calls.append(http_client.timeout)
        return SimpleNamespace(verify=SimpleNamespace(v2=SimpleNamespace(services=lambda sid: sid)))
    monkeypatch.setattr(sms, "Client", client)
    assert sms.service() == "test-only"
    assert calls == [10]
