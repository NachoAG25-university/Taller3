from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import datetime
from app import models, schemas
from app.auth import get_password_hash

# Funciones CRUD para User
def create_user(db: Session, user: schemas.UserCreate):
    """Crea un nuevo usuario"""
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    """Obtiene un usuario por su email"""
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    """Obtiene un usuario por su ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users_by_ids(db: Session, user_ids: List[int]):
    """Obtiene múltiples usuarios por sus IDs"""
    return db.query(models.User).filter(models.User.id.in_(user_ids)).all()

# Funciones CRUD para Task
def create_task(db: Session, task: schemas.TaskCreate, owner_id: int):
    """Crea una nueva tarea"""
    task_data = task.dict(exclude={'shared_with_user_ids', 'tags'})
    
    # Convertir tags de lista a string separado por comas
    if task.tags:
        task_data['tags'] = ','.join(task.tags)
    
    db_task = models.Task(**task_data, owner_id=owner_id)
    db.add(db_task)
    db.flush()  # Para obtener el ID antes de commit
    
    # Agregar usuarios con los que se comparte
    if task.shared_with_user_ids:
        shared_users = get_users_by_ids(db, task.shared_with_user_ids)
        db_task.shared_with_users.extend(shared_users)
    
    db.commit()
    db.refresh(db_task)
    return db_task

def get_tasks(db: Session, owner_id: int, skip: int = 0, limit: int = 100, 
              filters: Optional[schemas.TaskFilter] = None):
    """Obtiene todas las tareas de un usuario con filtros opcionales"""
    query = db.query(models.Task)
    
    # Incluir tareas propias y compartidas
    if filters and filters.include_shared:
        query = query.filter(
            or_(
                models.Task.owner_id == owner_id,
                models.Task.shared_with_users.any(models.User.id == owner_id)
            )
        )
    else:
        query = query.filter(models.Task.owner_id == owner_id)
    
    # Aplicar filtros
    if filters:
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    models.Task.title.like(search_term),
                    models.Task.description.like(search_term)
                )
            )
        
        if filters.category:
            query = query.filter(models.Task.category == filters.category)
        
        if filters.tags:
            # Buscar tareas que contengan cualquiera de los tags
            tag_conditions = []
            for tag in filters.tags:
                tag_conditions.append(models.Task.tags.like(f"%{tag}%"))
            if tag_conditions:
                query = query.filter(or_(*tag_conditions))
        
        if filters.completed is not None:
            query = query.filter(models.Task.completed == filters.completed)
        
        if filters.due_date_from:
            query = query.filter(models.Task.due_date >= filters.due_date_from)
        
        if filters.due_date_to:
            query = query.filter(models.Task.due_date <= filters.due_date_to)
    
    return query.offset(skip).limit(limit).all()

def get_task(db: Session, task_id: int, user_id: int):
    """Obtiene una tarea específica (propia o compartida)"""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        return None
    # Verificar si el usuario es el propietario o tiene acceso compartido
    if task.owner_id == user_id or any(u.id == user_id for u in task.shared_with_users):
        return task
    return None

def get_task_by_owner(db: Session, task_id: int, owner_id: int):
    """Obtiene una tarea específica solo si el usuario es el propietario"""
    return db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == owner_id
    ).first()

def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate, user_id: int):
    """Actualiza una tarea"""
    db_task = get_task(db, task_id, user_id)
    if not db_task:
        return None
    
    update_data = task_update.dict(exclude_unset=True, exclude={'shared_with_user_ids', 'tags'})
    
    # Manejar tags
    if 'tags' in task_update.dict(exclude_unset=True):
        if task_update.tags:
            update_data['tags'] = ','.join(task_update.tags)
        else:
            update_data['tags'] = None
    
    # Actualizar campos
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    # Actualizar usuarios compartidos (solo si es el propietario)
    if db_task.owner_id == user_id and 'shared_with_user_ids' in task_update.dict(exclude_unset=True):
        if task_update.shared_with_user_ids is not None:
            shared_users = get_users_by_ids(db, task_update.shared_with_user_ids)
            db_task.shared_with_users = shared_users
    
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int, owner_id: int):
    """Elimina una tarea (solo el propietario puede eliminar)"""
    db_task = get_task_by_owner(db, task_id, owner_id)
    if not db_task:
        return False
    db.delete(db_task)
    db.commit()
    return True

def share_task(db: Session, task_id: int, owner_id: int, user_ids: List[int]):
    """Comparte una tarea con otros usuarios"""
    db_task = get_task_by_owner(db, task_id, owner_id)
    if not db_task:
        return None
    
    shared_users = get_users_by_ids(db, user_ids)
    db_task.shared_with_users.extend(shared_users)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_categories(db: Session, user_id: int):
    """Obtiene todas las categorías únicas del usuario"""
    categories = db.query(models.Task.category).filter(
        models.Task.owner_id == user_id,
        models.Task.category.isnot(None)
    ).distinct().all()
    return [cat[0] for cat in categories if cat[0]]

def get_all_tags(db: Session, user_id: int):
    """Obtiene todas las etiquetas únicas del usuario"""
    tasks = db.query(models.Task.tags).filter(
        models.Task.owner_id == user_id,
        models.Task.tags.isnot(None)
    ).all()
    
    all_tags = set()
    for task in tasks:
        if task[0]:
            tags = [tag.strip() for tag in task[0].split(',')]
            all_tags.update(tags)
    
    return sorted(list(all_tags))
