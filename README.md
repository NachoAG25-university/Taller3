# 📋 Gestor de Tareas - Full Stack Application

## 📖 Descripción

Aplicación web full-stack para la gestión de tareas personales con autenticación JWT, desarrollada con FastAPI en el backend y React en el frontend. El proyecto implementa un sistema completo de autenticación y autorización, permitiendo a cada usuario gestionar sus propias tareas de forma segura.

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

#### Backend
- **Framework**: FastAPI 0.104.1
- **Lenguaje**: Python 3.11
- **Base de Datos**: MySQL 8.0
- **ORM**: SQLAlchemy 2.0.23
- **Autenticación**: JWT (JSON Web Tokens) con python-jose
- **Hashing**: bcrypt (passlib)
- **Migraciones**: Alembic 1.12.1
- **Servidor ASGI**: Uvicorn 0.24.0
- **Validación**: Pydantic 2.5.0

#### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.20.1
- **HTTP Client**: Axios 1.6.2
- **Estilos**: Tailwind CSS 3.3.6
- **Build Tool**: Create React App 5.0.1

#### DevOps
- **Containerización**: Docker & Docker Compose
- **Base de Datos**: MySQL 8.0 (contenedor Docker)
- **Orquestación**: Docker Compose 3.8

## 📁 Estructura del Proyecto

```
Taller3/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # Punto de entrada FastAPI
│   │   ├── database.py          # Configuración SQLAlchemy
│   │   ├── models.py            # Modelos de base de datos
│   │   ├── schemas.py           # Schemas Pydantic
│   │   ├── crud.py              # Operaciones CRUD
│   │   ├── auth.py              # Lógica de autenticación JWT
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── auth.py          # Endpoints de autenticación
│   │       └── tasks.py         # Endpoints de tareas
│   ├── alembic/                 # Migraciones de base de datos
│   │   ├── env.py
│   │   └── versions/
│   ├── alembic.ini
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── TaskForm.js
│   │   │   ├── TaskItem.js
│   │   │   └── TaskList.js
│   │   ├── pages/             # Páginas principales
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   └── DashboardPage.js
│   │   ├── context/           # Context API
│   │   │   └── AuthContext.js
│   │   ├── services/          # Servicios API
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── docker-compose.yml
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Docker**: Versión 20.10 o superior
- **Docker Compose**: Versión 2.0 o superior
- **Node.js**: Versión 16.x o superior
- **npm**: Versión 8.x o superior (incluido con Node.js)

### Instalación Local

#### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd Taller3
```

#### 2. Configuración del Backend

El backend se ejecuta mediante Docker Compose, que incluye tanto la base de datos MySQL como el servidor FastAPI.

```bash
# Desde la raíz del proyecto
docker-compose up --build
```

Esto iniciará:
- **MySQL**: `localhost:3306`
- **Backend API**: `http://localhost:8000`

**Documentación de la API:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

#### 3. Configuración del Frontend

```bash
cd frontend
npm install
npm start
```

El frontend estará disponible en: `http://localhost:3000`

### Variables de Entorno

#### Backend (Docker Compose)

Las variables de entorno están configuradas en `docker-compose.yml`:

```yaml
environment:
  DATABASE_URL: mysql+pymysql://root:rootpassword@db:3306/todo_db
```

#### Base de Datos MySQL

```yaml
environment:
  MYSQL_ROOT_PASSWORD: rootpassword
  MYSQL_DATABASE: todo_db
  MYSQL_USER: todo_user
  MYSQL_PASSWORD: todo_password
```

## 🔌 API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Registrar nuevo usuario | No requerida |
| `POST` | `/auth/login` | Iniciar sesión | No requerida |

**Request Body (Register/Login):**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Response (Login):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Tareas (Protegidos - Requieren JWT)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/tasks` | Obtener todas las tareas del usuario | ✅ JWT |
| `GET` | `/tasks/{task_id}` | Obtener una tarea específica | ✅ JWT |
| `POST` | `/tasks` | Crear una nueva tarea | ✅ JWT |
| `PUT` | `/tasks/{task_id}` | Actualizar una tarea | ✅ JWT |
| `DELETE` | `/tasks/{task_id}` | Eliminar una tarea | ✅ JWT |
| `POST` | `/tasks/{task_id}/share` | Compartir una tarea con usuarios | ✅ JWT |
| `GET` | `/tasks/categories/list` | Obtener todas las categorías | ✅ JWT |
| `GET` | `/tasks/tags/list` | Obtener todas las etiquetas | ✅ JWT |
| `GET` | `/tasks/export/json` | Exportar tareas en JSON | ✅ JWT |
| `GET` | `/tasks/export/csv` | Exportar tareas en CSV | ✅ JWT |
| `GET` | `/auth/users` | Obtener lista de usuarios | ✅ JWT |

**Headers requeridos para endpoints protegidos:**
```
Authorization: Bearer <token>
```

**Request Body (Create Task):**
```json
{
  "title": "Título de la tarea",
  "description": "Descripción opcional",
  "completed": false,
  "category": "Trabajo",
  "tags": ["importante", "urgente"],
  "due_date": "2024-12-31T23:59:59",
  "reminder_date": "2024-12-30T10:00:00",
  "shared_with_user_ids": [2, 3]
}
```

**Request Body (Update Task):**
```json
{
  "title": "Título actualizado",
  "description": "Nueva descripción",
  "completed": true,
  "category": "Personal",
  "tags": ["completado"],
  "due_date": "2024-12-31T23:59:59"
}
```

**Query Parameters (Get Tasks con filtros):**
```
GET /tasks?search=texto&category=Trabajo&tags=importante,urgente&completed=false&include_shared=true
```

**Request Body (Share Task):**
```json
{
  "user_ids": [2, 3, 5]
}
```

## 🗄️ Modelo de Datos

### Tabla: `users`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED | Email del usuario |
| `hashed_password` | VARCHAR(255) | NOT NULL | Contraseña hasheada con bcrypt |

### Tabla: `tasks`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| `title` | VARCHAR(255) | NOT NULL | Título de la tarea |
| `description` | VARCHAR(1000) | NULLABLE | Descripción opcional |
| `completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Estado de completado |
| `category` | VARCHAR(100) | NULLABLE, INDEXED | Categoría de la tarea |
| `tags` | VARCHAR(500) | NULLABLE | Etiquetas separadas por comas |
| `due_date` | DATETIME | NULLABLE, INDEXED | Fecha de vencimiento |
| `reminder_date` | DATETIME | NULLABLE | Fecha de recordatorio |
| `owner_id` | INTEGER | FOREIGN KEY → users.id | Propietario de la tarea |
| `created_at` | DATETIME | NOT NULL | Fecha de creación |
| `updated_at` | DATETIME | NOT NULL | Fecha de última actualización |

### Tabla: `task_shared_with`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `task_id` | INTEGER | PRIMARY KEY, FOREIGN KEY → tasks.id | ID de la tarea |
| `user_id` | INTEGER | PRIMARY KEY, FOREIGN KEY → users.id | ID del usuario con acceso |

### Relaciones

- **User → Tasks**: One-to-Many (un usuario tiene muchas tareas)
- **Task → User**: Many-to-One (una tarea pertenece a un usuario)
- **Task ↔ User (Shared)**: Many-to-Many (una tarea puede ser compartida con múltiples usuarios)
- **Cascade Delete**: Al eliminar un usuario, se eliminan todas sus tareas

## 🔐 Seguridad

### Autenticación JWT

- **Algoritmo**: HS256
- **Expiración del token**: 30 minutos
- **Formato**: Bearer Token en header `Authorization`

### Hashing de Contraseñas

- **Algoritmo**: bcrypt
- **Rounds**: 12 (configuración por defecto de passlib)

### CORS (Cross-Origin Resource Sharing)

Orígenes permitidos:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

### Autorización

- Cada usuario solo puede acceder a sus propias tareas
- Validación de ownership en todos los endpoints de tareas
- Tokens JWT validados en cada request protegido

## 🧪 Desarrollo

### Ejecutar en Modo Desarrollo

#### Backend

El backend se ejecuta con `--reload` para recarga automática:

```bash
docker-compose up
```

#### Frontend

```bash
cd frontend
npm start
```

### Migraciones de Base de Datos

**Importante**: Las migraciones deben ejecutarse dentro del contenedor Docker.

Para crear una nueva migración:

```bash
docker-compose exec backend alembic revision --autogenerate -m "Descripción del cambio"
```

Para aplicar migraciones:

```bash
docker-compose exec backend alembic upgrade head
```

Para ver el estado actual:

```bash
docker-compose exec backend alembic current
```

Para ver el historial de migraciones:

```bash
docker-compose exec backend alembic history
```

### Estructura de Código

#### Backend

- **Routers**: Endpoints organizados por dominio (auth, tasks)
- **CRUD**: Operaciones de base de datos separadas en `crud.py`
- **Schemas**: Validación y serialización con Pydantic
- **Models**: Definición de modelos SQLAlchemy

#### Frontend

- **Componentes**: Componentes reutilizables en `/components`
- **Páginas**: Páginas principales en `/pages`
- **Context**: Estado global con React Context API
- **Services**: Llamadas a la API centralizadas en `/services`

## 📦 Dependencias Principales

### Backend (`requirements.txt`)

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pymysql==1.1.0
cryptography==41.0.7
alembic==1.12.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==3.2.2
pydantic[email]==2.5.0
python-multipart==0.0.6
```

### Frontend (`package.json`)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

## 🐳 Docker

### Servicios Docker Compose

1. **db** (MySQL 8.0)
   - Puerto: `3306:3306`
   - Volumen persistente: `mysql_data`
   - Healthcheck configurado

2. **backend** (FastAPI)
   - Puerto: `8000:8000`
   - Depende de: `db` (con condición de healthcheck)
   - Volumen montado para desarrollo: `./backend:/app`
   - Modo reload activado

### Comandos Docker Útiles

```bash
# Iniciar servicios
docker-compose up

# Iniciar en segundo plano
docker-compose up -d

# Reconstruir contenedores
docker-compose up --build

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Limpiar volúmenes (⚠️ elimina datos)
docker-compose down -v
```

## 📝 Funcionalidades Implementadas

### Autenticación
- ✅ Registro de usuarios con validación de email
- ✅ Inicio de sesión con JWT
- ✅ Protección de rutas en frontend
- ✅ Cierre de sesión
- ✅ Persistencia de sesión (localStorage)

### Gestión de Tareas (CRUD Completo)
- ✅ **Crear**: Agregar nuevas tareas con título, descripción, categoría, etiquetas, fechas de vencimiento y recordatorio
- ✅ **Leer**: Listar todas las tareas del usuario autenticado (propias y compartidas)
- ✅ **Actualizar**: Editar todos los campos de la tarea
- ✅ **Eliminar**: Borrar tareas individuales
- ✅ Filtrado por usuario (cada usuario ve solo sus tareas y las compartidas)

### Funcionalidades Avanzadas
- ✅ **Filtrado y Búsqueda**: Búsqueda por texto, filtrado por categoría, etiquetas, estado y fechas
- ✅ **Categorías y Etiquetas**: Organización de tareas mediante categorías y múltiples etiquetas
- ✅ **Fechas de Vencimiento**: Asignación de fechas límite con indicadores visuales de vencimiento
- ✅ **Recordatorios y Notificaciones**: Sistema de recordatorios con notificaciones del navegador
- ✅ **Compartir Tareas**: Compartir tareas entre usuarios con control de acceso
- ✅ **Exportación de Tareas**: Exportar tareas en formato JSON y CSV
- ✅ **Modo Oscuro/Claro**: Tema oscuro y claro con persistencia de preferencia
- ✅ **Sincronización Offline**: Almacenamiento local y sincronización automática al recuperar conexión

### Interfaz de Usuario
- ✅ Diseño responsive con Tailwind CSS
- ✅ Modo oscuro/claro con transiciones suaves
- ✅ Formularios de registro e inicio de sesión
- ✅ Dashboard completo con filtros y búsqueda
- ✅ Formulario avanzado para crear/editar tareas
- ✅ Indicadores visuales de estado (completado/pendiente/vencido)
- ✅ Badges para categorías, etiquetas y fechas
- ✅ Interfaz intuitiva y moderna

## 🔧 Troubleshooting

### Problemas Comunes

#### Backend no se conecta a la base de datos

1. Verificar que MySQL esté corriendo:
```bash
docker-compose ps
```

2. Verificar logs:
```bash
docker-compose logs db
docker-compose logs backend
```

#### Error de CORS en el frontend

Verificar que el backend tenga configurado el origen correcto en `main.py`:
```python
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

El backend incluye manejadores de excepciones que aseguran que los headers CORS se envíen incluso en caso de errores 500.

#### Problemas con migraciones de base de datos

Si la base de datos no tiene las columnas necesarias, ejecutar migraciones:
```bash
docker-compose exec backend alembic upgrade head
```

Para crear nuevas migraciones:
```bash
docker-compose exec backend alembic revision --autogenerate -m "Descripción del cambio"
```

#### Token JWT expirado

Los tokens expiran después de 30 minutos. El usuario debe iniciar sesión nuevamente.

#### Puerto 3306 ya en uso

Si MySQL está corriendo localmente, cambiar el puerto en `docker-compose.yml`:
```yaml
ports:
  - "3307:3306"  # Cambiar 3306 a 3307
```

## 📚 Recursos Adicionales

- [Documentación FastAPI](https://fastapi.tiangolo.com/)
- [Documentación React](https://react.dev/)
- [Documentación Tailwind CSS](https://tailwindcss.com/docs)
- [Documentación SQLAlchemy](https://docs.sqlalchemy.org/)
- [Documentación Docker Compose](https://docs.docker.com/compose/)

## 📄 Licencia

Este proyecto es de uso educativo.

## 👥 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Notas de Versión

### Versión 2.1.0 (Actual)
- ✅ Mejoras de rendimiento en búsqueda con debounce (500ms)
- ✅ Configuración mejorada de CORS con manejo de errores
- ✅ Migraciones de Alembic implementadas y documentadas
- ✅ Preparación para React Router v7 (flags futuros)
- ✅ Optimización de experiencia de usuario en filtros
- ✅ Mejora en el manejo de estados de carga

### Versión 2.0.0
- ✅ Filtrado y búsqueda avanzada de tareas
- ✅ Sistema de categorías y etiquetas
- ✅ Fechas de vencimiento con indicadores visuales
- ✅ Sistema de recordatorios y notificaciones
- ✅ Compartir tareas entre usuarios
- ✅ Exportación de tareas (JSON y CSV)
- ✅ Modo oscuro/claro con persistencia
- ✅ Sincronización offline básica
- ✅ Interfaz mejorada con Tailwind CSS dark mode

### Versión 1.0.0
- ✅ Implementación inicial del sistema de autenticación JWT
- ✅ CRUD completo de tareas
- ✅ Frontend con React y Tailwind CSS
- ✅ Backend con FastAPI y MySQL
- ✅ Containerización con Docker Compose
- ✅ Documentación de API con Swagger/ReDoc

---

**Última actualización**: 2024-11-12

> 💡 **Nota**: Ejecuta `python scripts/update_readme_dependencies.py` para actualizar automáticamente las dependencias y la fecha.
