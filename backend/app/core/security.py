"""Security utilities for password hashing, credential encryption, and JWT token management."""

import base64
import json
import logging
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
import jwt
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from app.core.config import settings

logger = logging.getLogger(__name__)

SECRET_KEY = getattr(settings, "SECRET_KEY", None) or "opsforge-secret-key-2026-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


def _get_fernet_key() -> bytes:
    """Derive a 32-byte url-safe base64 key from settings.SECRET_KEY."""
    secret = SECRET_KEY.encode("utf-8")
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


# Password Hashing Utilities (PBKDF2 SHA256)
def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored hash."""
    try:
        salt, key_hex = hashed_password.split("$")
        key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return secrets.compare_digest(key.hex(), key_hex)
    except Exception:
        return False


# JWT Token Utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None
