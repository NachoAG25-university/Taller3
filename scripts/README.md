# Scripts de Utilidad

## update_readme_dependencies.py

Script para actualizar automáticamente las secciones de dependencias en `README.md` basándose en los archivos `requirements.txt` y `package.json`.

### Uso

```bash
# Desde la raíz del proyecto
python scripts/update_readme_dependencies.py
```

### Funcionalidades

- Lee las dependencias del backend desde `backend/requirements.txt`
- Lee las dependencias del frontend desde `frontend/package.json`
- Actualiza la sección "Dependencias Principales" en el README
- Actualiza la fecha de "Última actualización"

### Requisitos

- Python 3.7+
- Archivos `requirements.txt` y `package.json` deben existir

### Notas

- El script preserva el resto del contenido del README
- Solo actualiza las secciones de dependencias y la fecha
- Es recomendable ejecutar este script después de actualizar dependencias

