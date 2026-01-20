from typing import Optional
from sqlalchemy.orm import Session
from app.models.user_settings import UserSettings
from app.repositories.base_repository import BaseRepository


class UserSettingsRepository(BaseRepository[UserSettings]):
    def __init__(self, db: Session):
        super().__init__(UserSettings, db)

    def get_by_user(self, user_id: int) -> Optional[UserSettings]:
        return self.db.query(UserSettings).filter(UserSettings.user_id == user_id).first()

    def get_or_create(self, user_id: int) -> UserSettings:
        settings = self.get_by_user(user_id)
        if not settings:
            settings = self.create({"user_id": user_id})
        return settings
