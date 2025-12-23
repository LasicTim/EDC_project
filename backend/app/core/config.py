import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mysql_host: str
    mysql_port: int
    mysql_user: str
    mysql_password: str
    mysql_database: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    reports_dir: str

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), '../.env')


settings = Settings()

# Access the values
print(settings.mysql_host)  # Output: 127.0.0.1
