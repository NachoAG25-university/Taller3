# 🔄 Guía para Actualizar el README.md

## Proceso de Actualización del README

Cada vez que se realice un ajuste al proyecto, es importante actualizar el README.md para mantener la documentación sincronizada con el código.

## 🤖 Actualización Automática de Dependencias

Para actualizar automáticamente las secciones de dependencias y la fecha de actualización:

```bash
python scripts/update_readme_dependencies.py
```

Este script:
- ✅ Lee las dependencias de `backend/requirements.txt`
- ✅ Lee las dependencias de `frontend/package.json`
- ✅ Actualiza las secciones correspondientes en el README
- ✅ Actualiza la fecha de última actualización

**Recomendación**: Ejecuta este script después de actualizar cualquier dependencia del proyecto.

## 📋 Checklist de Actualización

### Cuando agregues nuevas funcionalidades:
- [ ] Actualizar la sección "Funcionalidades Implementadas"
- [ ] Agregar nuevos endpoints en "API Endpoints" si aplica
- [ ] Actualizar el modelo de datos si hay cambios en las tablas
- [ ] Actualizar "Dependencias Principales" si se agregaron nuevas librerías
- [ ] Actualizar "Notas de Versión" con la nueva versión

### Cuando modifiques la estructura del proyecto:
- [ ] Actualizar "Estructura del Proyecto"
- [ ] Verificar que todos los archivos mencionados existan
- [ ] Actualizar rutas y paths si cambiaron

### Cuando cambies configuraciones:
- [ ] Actualizar "Variables de Entorno"
- [ ] Actualizar "Docker" si hay cambios en docker-compose.yml
- [ ] Actualizar puertos si cambiaron
- [ ] Actualizar URLs de documentación si aplica

### Cuando actualices dependencias:
- [ ] Actualizar versiones en "Stack Tecnológico"
- [ ] Actualizar "Dependencias Principales" con nuevas versiones
- [ ] Verificar compatibilidad entre versiones

### Cuando agregues nuevas tecnologías:
- [ ] Agregar en "Stack Tecnológico"
- [ ] Explicar su propósito en el proyecto
- [ ] Actualizar "Dependencias Principales"

## 🔧 Secciones del README que Requieren Atención

### 1. Stack Tecnológico
Ubicación: Líneas ~15-35
- Actualizar versiones de frameworks y librerías
- Agregar nuevas tecnologías utilizadas

### 2. Estructura del Proyecto
Ubicación: Líneas ~37-65
- Reflejar cambios en la organización de archivos
- Agregar nuevos directorios o archivos importantes

### 3. API Endpoints
Ubicación: Líneas ~100-140
- Agregar nuevos endpoints
- Actualizar descripciones de endpoints existentes
- Actualizar ejemplos de request/response

### 4. Modelo de Datos
Ubicación: Líneas ~142-170
- Agregar nuevas tablas
- Actualizar campos existentes
- Documentar nuevas relaciones

### 5. Dependencias Principales
Ubicación: Líneas ~200-230
- Actualizar versiones
- Agregar nuevas dependencias
- Remover dependencias obsoletas

### 6. Funcionalidades Implementadas
Ubicación: Líneas ~250-280
- Marcar nuevas funcionalidades como implementadas
- Actualizar descripciones

### 7. Notas de Versión
Ubicación: Final del documento
- Agregar nueva entrada con fecha
- Listar cambios realizados
- Incrementar número de versión

## 📝 Ejemplo de Actualización

### Antes de un cambio:
```markdown
## Funcionalidades Implementadas
- ✅ Registro de usuarios
- ✅ Inicio de sesión
```

### Después de agregar nueva funcionalidad:
```markdown
## Funcionalidades Implementadas
- ✅ Registro de usuarios
- ✅ Inicio de sesión
- ✅ Recuperación de contraseña (NUEVO)
```

## 🚀 Comandos Útiles para Verificar Cambios

### Verificar dependencias del backend:
```bash
cat backend/requirements.txt
```

### Verificar dependencias del frontend:
```bash
cat frontend/package.json
```

### Verificar estructura de archivos:
```bash
tree -L 3 -I 'node_modules|__pycache__|*.pyc'
```

### Verificar endpoints de la API:
```bash
# Revisar routers en backend/app/routers/
```

## ⚠️ Importante

1. **Siempre actualizar la fecha** en "Última actualización" al final del README
2. **Mantener consistencia** en el formato y estilo
3. **Verificar enlaces** y URLs si se modifican
4. **Probar comandos** antes de documentarlos
5. **Revisar ortografía** y gramática

## 📅 Frecuencia Recomendada

- **Después de cada feature**: Actualizar inmediatamente
- **Después de cada bug fix importante**: Actualizar si afecta documentación
- **Al finalizar un sprint**: Revisión completa del README
- **Antes de un release**: Verificación exhaustiva

## 🔍 Revisión Final

Antes de hacer commit de cambios al README, verificar:

- [ ] Todas las secciones están actualizadas
- [ ] Los comandos funcionan correctamente
- [ ] Las versiones son correctas
- [ ] No hay información obsoleta
- [ ] El formato es consistente
- [ ] La fecha de actualización es correcta

---

**Nota**: Este documento debe ser actualizado también cuando se modifique el proceso de actualización del README.

