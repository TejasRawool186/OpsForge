"""Request Guard Middleware — Payload verification and request validation."""

import logging
import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class RequestGuardMiddleware(BaseHTTPMiddleware):
    """Middleware for request logging, timing, content-type verification, and security headers."""

    MAX_BODY_SIZE = 10 * 1024 * 1024  # 10MB

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        logger.info(f"→ {request.method} {request.url.path}")

        if request.method in ("POST", "PUT", "PATCH"):
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > self.MAX_BODY_SIZE:
                from fastapi.responses import JSONResponse
                return JSONResponse(
                    status_code=413,
                    content={"error": "PAYLOAD_TOO_LARGE", "message": "Request body exceeds maximum size (10MB)"},
                )

        response: Response = await call_next(request)

        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = f"{process_time:.4f}"
        response.headers["X-Powered-By"] = "OpsForge/1.0"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"

        logger.info(f"← {request.method} {request.url.path} → {response.status_code} ({process_time:.3f}s)")

        return response
