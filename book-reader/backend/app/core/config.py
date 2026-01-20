from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    env: str = "development"
    debug: bool = True
    
    skip_tg_validation: bool = True
    test_user_id: Optional[int] = 123456789
    test_username: Optional[str] = "dev_user"
    
    tg_bot_token: Optional[str] = None
    
    database_url: str = "sqlite:///./data/database.db"
    
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    
    tor_proxy_host: str = "localhost"
    tor_proxy_port: int = 9050
    flibusta_url: str = "https://flibusta.is"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
