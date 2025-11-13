from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session
from datetime import datetime
import json
import csv
from io import StringIO
from app import schemas, crud, models
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

def serialize_task_for_response(task: models.Task) -> dict:
    """Serializa una tarea para la respuesta, incluyendo tags como lista"""
    # Obtener tags como lista
    tags_list = []
    if task.tags:
        tags_list = [tag.strip() for tag in task.tags.split(',') if tag.strip()]
    
    result = {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "completed": task.completed,
        "category": task.category,
        "tags": tags_list,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "reminder_date": task.reminder_date.isoformat() if task.reminder_date else None,
        "owner_id": task.owner_id,
        "created_at": task.created_at.isoformat() if task.created_at else None,
        "updated_at": task.updated_at.isoformat() if task.updated_at else None,
        "shared_with_user_ids": [u.id for u in task.shared_with_users] if task.shared_with_users else []
    }
    return result

@router.post("", status_code=status.HTTP_201_CREATED)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Crea una nueva tarea"""
    db_task = crud.create_task(db=db, task=task, owner_id=current_user.id)
    return serialize_task_for_response(db_task)

@router.get("")
def read_tasks(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category: Optional[str] = None,
    tags: Optional[str] = None,  # Coma separada
    completed: Optional[bool] = None,
    due_date_from: Optional[datetime] = None,
    due_date_to: Optional[datetime] = None,
    include_shared: bool = True,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obtiene todas las tareas del usuario actual con filtros opcionales"""
    filters = schemas.TaskFilter(
        search=search,
        category=category,
        tags=tags.split(',') if tags else None,
        completed=completed,
        due_date_from=due_date_from,
        due_date_to=due_date_to,
        include_shared=include_shared
    )
    tasks = crud.get_tasks(db, owner_id=current_user.id, skip=skip, limit=limit, filters=filters)
    return [serialize_task_for_response(task) for task in tasks]

@router.get("/{task_id}")
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obtiene una tarea específica"""
    task = crud.get_task(db, task_id=task_id, user_id=current_user.id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return serialize_task_for_response(task)

@router.put("/{task_id}")
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Actualiza una tarea"""
    task = crud.update_task(db, task_id=task_id, task_update=task_update, user_id=current_user.id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return serialize_task_for_response(task)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Elimina una tarea"""
    success = crud.delete_task(db, task_id=task_id, owner_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return None

@router.post("/{task_id}/share", response_model=schemas.TaskResponse)
def share_task(
    task_id: int,
    share_request: schemas.ShareTaskRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Comparte una tarea con otros usuarios"""
    task = crud.share_task(db, task_id=task_id, owner_id=current_user.id, user_ids=share_request.user_ids)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return serialize_task_for_response(task)

@router.get("/categories/list")
def get_categories(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obtiene todas las categorías del usuario"""
    categories = crud.get_categories(db, user_id=current_user.id)
    return {"categories": categories}

@router.get("/tags/list")
def get_tags(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obtiene todas las etiquetas del usuario"""
    tags = crud.get_all_tags(db, user_id=current_user.id)
    return {"tags": tags}

@router.get("/export/json")
def export_tasks_json(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Exporta todas las tareas del usuario en formato JSON"""
    tasks = crud.get_tasks(db, owner_id=current_user.id, skip=0, limit=10000)
    tasks_data = [serialize_task_for_response(task) for task in tasks]
    return Response(
        content=json.dumps(tasks_data, indent=2, ensure_ascii=False),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=tareas.json"}
    )

@router.get("/export/csv")
def export_tasks_csv(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Exporta todas las tareas del usuario en formato CSV"""
    tasks = crud.get_tasks(db, owner_id=current_user.id, skip=0, limit=10000)
    
    output = StringIO()
    writer = csv.writer(output)
    
    # Encabezados
    writer.writerow(['ID', 'Título', 'Descripción', 'Completada', 'Categoría', 'Etiquetas', 
                     'Fecha Vencimiento', 'Fecha Recordatorio', 'Fecha Creación', 'Fecha Actualización'])
    
    # Datos
    for task in tasks:
        writer.writerow([
            task.id,
            task.title,
            task.description or '',
            'Sí' if task.completed else 'No',
            task.category or '',
            task.tags or '',
            task.due_date.strftime('%Y-%m-%d %H:%M:%S') if task.due_date else '',
            task.reminder_date.strftime('%Y-%m-%d %H:%M:%S') if task.reminder_date else '',
            task.created_at.strftime('%Y-%m-%d %H:%M:%S') if task.created_at else '',
            task.updated_at.strftime('%Y-%m-%d %H:%M:%S') if task.updated_at else ''
        ])
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=tareas.csv"}
    )
