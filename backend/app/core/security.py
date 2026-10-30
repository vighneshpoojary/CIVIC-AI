import jwt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
from app.core.config import settings

security = HTTPBearer(auto_error=False)

def decode_token(token: str) -> Dict[str, Any]:
    """
    Cryptographically verifies and decodes Supabase JWT token using the legacy JWT Secret.
    """
    jwt_secret = getattr(settings, "JWT_SECRET", None) or settings.SUPABASE_ANON_KEY
    try:
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please log in again."
        )
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> Dict[str, Any]:
    """
    Extracts and validates user payload from Authorization Bearer header.
    """
    if not credentials:
        # For development / public testing, return mock authenticated citizen
        return {
            "sub": "demo-citizen-id-001",
            "email": "citizen@civicai.org",
            "role": "citizen"
        }
    return decode_token(credentials.credentials)

def require_role(allowed_roles: list[str]):
    """
    Enforces role-based authorization (e.g. ['admin', 'officer']).
    """
    def role_checker(current_user: Dict[str, Any] = Security(get_current_user)):
        user_role = current_user.get("role", "citizen")
        if user_role not in allowed_roles and user_role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker
