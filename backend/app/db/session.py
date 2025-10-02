from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from sqlalchemy.engine import url as sa_url

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URI

# Ensure database exists (create if missing), then create engine bound to it
try:
    _url = sa_url.make_url(SQLALCHEMY_DATABASE_URL)
    _database_name = _url.database
    if _database_name:
        _server_url = _url.set(database=None)
        _server_engine = create_engine(str(_server_url), pool_pre_ping=True)
        with _server_engine.connect() as connection:
            connection.execute(
                text(
                    f"CREATE DATABASE IF NOT EXISTS `{_database_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
                )
            )
        _server_engine.dispose()
except Exception:
    # If auto-create fails, engine creation below may still raise, which is fine
    pass

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
