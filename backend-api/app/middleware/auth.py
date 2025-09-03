"""
Clerk JWT authentication middleware for FastAPI.
"""

import os
import jwt
import structlog
from typing import Optional, Set
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = structlog.get_logger("atom.api.auth")

class ClerkJWTMiddleware(BaseHTTPMiddleware):
    """Middleware to verify Clerk JWT tokens on protected routes."""
    
    def __init__(self):
        self.clerk_secret_key = os.getenv("CLERK_SECRET_KEY")
        self.clerk_publishable_key = os.getenv("CLERK_PUBLISHABLE_KEY")
        
        # Routes that require authentication
        self.protected_paths: Set[str] = {
            "/api/admin",
            "/api/trigger",
            "/api/dashboard",
            "/api/internal",
        }
        
        # Routes that are always public
        self.public_paths: Set[str] = {
            "/",
            "/health",
            "/health/ready",
            "/metrics",
            "/docs",
            "/redoc",
            "/openapi.json",
        }
        
        if not self.clerk_secret_key:
            logger.warning("CLERK_SECRET_KEY not configured - JWT verification disabled")
    
    async def dispatch(self, request: Request, call_next):
        """Process request and verify JWT if needed."""
        
        # Skip authentication if Clerk is not configured
        if not self.clerk_secret_key:
            return await call_next(request)
        
        # Check if path requires authentication
        path = request.url.path
        requires_auth = self._requires_authentication(path)
        
        if requires_auth:
            try:
                user_id = await self._verify_jwt(request)
                request.state.user_id = user_id
                logger.info("Authenticated request", user_id=user_id, path=path)
            except HTTPException as e:
                logger.warning("Authentication failed", path=path, error=e.detail)
                raise e
            except Exception as e:
                logger.error("Authentication error", path=path, error=str(e))
                raise HTTPException(status_code=500, detail="Authentication error")
        
        return await call_next(request)
    
    def _requires_authentication(self, path: str) -> bool:
        """Check if a path requires authentication."""
        
        # Check public paths first
        for public_path in self.public_paths:
            if path.startswith(public_path):
                return False
        
        # Check protected paths
        for protected_path in self.protected_paths:
            if path.startswith(protected_path):
                return True
        
        # Default to no authentication for other paths
        return False
    
    async def _verify_jwt(self, request: Request) -> str:
        """Verify JWT token and return user ID."""
        
        # Get token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(status_code=401, detail="Missing Authorization header")
        
        if not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid Authorization header format")
        
        token = auth_header[7:]  # Remove "Bearer " prefix
        
        try:
            # Decode JWT token
            payload = jwt.decode(
                token,
                self.clerk_secret_key,
                algorithms=["HS256"],
                options={"verify_exp": True}
            )
            
            # Extract user ID
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")
            
            return user_id
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    
    def add_protected_path(self, path: str):
        """Add a path to the protected paths set."""
        self.protected_paths.add(path)
    
    def add_public_path(self, path: str):
        """Add a path to the public paths set."""
        self.public_paths.add(path)


def get_current_user_id(request: Request) -> Optional[str]:
    """Get the current user ID from the request state."""
    return getattr(request.state, "user_id", None)


def require_auth(request: Request) -> str:
    """Require authentication and return user ID."""
    user_id = get_current_user_id(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user_id