from sqlalchemy import Column, DateTime, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class AppInfo(Base):
    __tablename__ = "app_info"

    id = Column(String, primary_key=True)
    projectName = Column("project_name", String, nullable=False)
    frontend = Column(String, nullable=False)
    backend = Column(String, nullable=False)
    database = Column(String, nullable=False)
    orm = Column(String, nullable=False)
    uiFramework = Column("ui_framework", String, nullable=False)
    authentication = Column(String, nullable=False)
    docker = Column(String, nullable=False)
    createdAt = Column("created_at", DateTime, nullable=False)
