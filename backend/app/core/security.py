"""Security utilities for credential encryption and hashing."""

import base64
import json
import logging
from typing import Dict, Any, Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from app.core.config import settings

logger = logging.getLogger(__name__)


def _get_fernet_key() -> bytes:
    """Derive a 32-byte url-safe base64 key from settings.SECRET_KEY."""
    secret = (getattr(settings, "SECRET_KEY", None) or "opsforge-secret-key-2026-production").encode()
    salt = b"opsforge_integration_salt_2026"
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    return base64.urlsafe_b64encode(kdf.derive(secret))


def encrypt_credentials(creds_dict: Dict[str, Any]) -> str:
    """Encrypt a credentials dictionary using AES-256 (Fernet) and return base64 string."""
    if not creds_dict:
        return ""
    try:
        key = _get_fernet_key()
        fernet = Fernet(key)
        json_bytes = json.dumps(creds_dict).encode("utf-8")
        encrypted_bytes = fernet.encrypt(json_bytes)
        return encrypted_bytes.decode("utf-8")
    except Exception as exc:
        logger.exception("Failed to encrypt credentials")
        raise ValueError(f"Credential encryption failed: {exc}") from exc


def decrypt_credentials(encrypted_str: Optional[str]) -> Dict[str, Any]:
    """Decrypt an encrypted base64 string back into a credentials dictionary."""
    if not encrypted_str:
        return {}
    try:
        key = _get_fernet_key()
        fernet = Fernet(key)
        decrypted_bytes = fernet.decrypt(encrypted_str.encode("utf-8"))
        return json.loads(decrypted_bytes.decode("utf-8"))
    except Exception as exc:
        logger.exception("Failed to decrypt credentials")
        return {}
