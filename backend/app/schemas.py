from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Schemas para User
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

# Schemas para Task
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    reminder_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    shared_with_user_ids: Optional[List[int]] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    reminder_date: Optional[datetime] = None
    shared_with_user_ids: Optional[List[int]] = None

class TaskResponse(TaskBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    shared_with_user_ids: Optional[List[int]] = None

    class Config:
        from_attributes = True

# Schema para búsqueda y filtrado
class TaskFilter(BaseModel):
    search: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    completed: Optional[bool] = None
    due_date_from: Optional[datetime] = None
    due_date_to: Optional[datetime] = None
    include_shared: bool = True

# Schema para compartir tarea
class ShareTaskRequest(BaseModel):
    user_ids: List[int]

# Schema para Login
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
