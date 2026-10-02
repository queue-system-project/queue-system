from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from dotenv import load_dotenv
import os
from sqlalchemy.orm import declarative_base

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")


def pool_options(url):
    """Ograniczona pula połączeń PostgreSQL utrzymywana między seriami żądań.

    Testy SQLite mają własne silniki i nie obsługują tych opcji puli.
    Limit serwera powinien uwzględniać łącznie procesy API i wysyłania push.
    """
    if not url or not url.startswith("postgresql"):
        return {}
    values = {}
    for name, default, minimum, maximum in (
        ("DB_POOL_SIZE", 10, 1, 50),
        ("DB_MAX_OVERFLOW", 0, 0, 50),
        ("DB_POOL_TIMEOUT", 10, 1, 120),
    ):
        try:
            value = int(os.getenv(name, default))
        except ValueError:
            raise ValueError(f"{name} must be an integer") from None
        if not minimum <= value <= maximum:
            raise ValueError(f"{name} must be between {minimum} and {maximum}")
        values[name] = value
    return {"pool_size": values["DB_POOL_SIZE"], "max_overflow": values["DB_MAX_OVERFLOW"],
            "pool_timeout": values["DB_POOL_TIMEOUT"]}


# Wyłączone echo chroni parametry zapytań przed zapisem w dziennikach.
engine = create_async_engine(DATABASE_URL, echo=False, **pool_options(DATABASE_URL))

SessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False
)

Base = declarative_base()
