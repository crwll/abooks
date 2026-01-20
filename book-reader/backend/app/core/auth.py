from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
import hashlib
import hmac
from urllib.parse import parse_qs

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository


def validate_telegram_init_data(init_data: str) -> dict:
    if settings.skip_tg_validation:
        return {
            "user": {
                "id": settings.test_user_id,
                "username": settings.test_username,
                "first_name": "Dev",
                "last_name": "User"
            }
        }
    
    if not settings.tg_bot_token:
        raise HTTPException(status_code=500, detail="Bot token not configured")
    
    try:
        parsed = parse_qs(init_data)
        
        hash_value = parsed.get('hash', [''])[0]
        if not hash_value:
            raise HTTPException(status_code=401, detail="Hash not found")
        
        data_check_items = []
        for key, value in parsed.items():
            if key != 'hash':
                data_check_items.append(f"{key}={value[0]}")
        
        data_check_string = '\n'.join(sorted(data_check_items))
        
        secret_key = hmac.new(
            b"WebAppData",
            settings.tg_bot_token.encode(),
            hashlib.sha256
        ).digest()
        
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if calculated_hash != hash_value:
            raise HTTPException(status_code=401, detail="Invalid hash")
        
        user_data = parsed.get('user', ['{}'])[0]
        import json
        return {"user": json.loads(user_data)}
    
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid init data: {str(e)}")


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    if not authorization:
        if settings.skip_tg_validation:
            user_repo = UserRepository(db)
            user = user_repo.get_by_telegram_id(settings.test_user_id)
            if not user:
                user = user_repo.create({
                    "telegram_id": settings.test_user_id,
                    "username": settings.test_username
                })
            return user
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        init_data = authorization.replace("Bearer ", "")
        validated_data = validate_telegram_init_data(init_data)
        
        telegram_id = validated_data["user"]["id"]
        username = validated_data["user"].get("username", "")
        
        user_repo = UserRepository(db)
        user = user_repo.get_by_telegram_id(telegram_id)
        
        if not user:
            user = user_repo.create({
                "telegram_id": telegram_id,
                "username": username
            })
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
