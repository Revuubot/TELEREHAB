from sqlmodel import create_engine, Session, SQLModel
from .config import DATABASE_URL

engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session

def init_db():
    SQLModel.metadata.create_all(engine)

def get_db():
    """
    Get DB session - use this in FastAPI dependency injection
    """
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.close()