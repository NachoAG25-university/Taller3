from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.database import Base

# Tabla de asociación para tareas compartidas (many-to-many)
task_shared_with = Table(
    'task_shared_with',
    Base.metadata,
    Column('task_id', Integer, ForeignKey('tasks.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # Relación con las tareas
    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")
    # Relación con tareas compartidas
    shared_tasks = relationship("Task", secondary=task_shared_with, back_populates="shared_with_users")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    category = Column(String(100), nullable=True, index=True)
    tags = Column(String(500), nullable=True)  # Almacenado como string separado por comas
    due_date = Column(DateTime, nullable=True, index=True)
    reminder_date = Column(DateTime, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relación con el usuario propietario
    owner = relationship("User", back_populates="tasks")
    # Relación con usuarios con los que se comparte la tarea
    shared_with_users = relationship("User", secondary=task_shared_with, back_populates="shared_tasks")
