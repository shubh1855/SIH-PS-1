from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""
    IMD_API_URL: str = "https://mausam.imd.gov.in/imd_latest/contents/rajbhasha/rainfall_statistics.php"
    DATABASE_URL: str = "sqlite:///./data.db"
    ALERT_PHONE_NUMBERS: str = ""

    model_config = SettingsConfigDict(env_file='.env')

@lru_cache
def get_settings():
    return Settings()
