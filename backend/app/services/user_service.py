"""Service layer for User authentication and management."""

import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token

logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email.lower().strip())
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_by_id(self, user_id: str) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def create_user(
        self,
        email: str,
        password: str,
        full_name: Optional[str] = None,
        role: str = "SRE_OPERATOR",
    ) -> User:
        existing = await self.get_by_email(email)
        if existing:
            raise ValueError("User with this email already exists")

        hashed = hash_password(password)
        user = User(
            email=email.lower().strip(),
            hashed_password=hashed,
            full_name=full_name or email.split("@")[0].capitalize(),
            role=role,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        logger.info(f"User created: {user.email} (Role: {user.role})")
        return user

    async def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        user = await self.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            raise ValueError("User account is deactivated")

        token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user.to_dict(),
        }
