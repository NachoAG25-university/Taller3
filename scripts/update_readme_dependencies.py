#!/usr/bin/env python3
"""
Script para actualizar automáticamente las secciones de dependencias en README.md
basándose en los archivos requirements.txt y package.json
"""

import re
import json
from pathlib import Path
from datetime import datetime

def read_requirements():
    """Lee las dependencias del backend desde requirements.txt"""
    requirements_path = Path(__file__).parent.parent / "backend" / "requirements.txt"
    dependencies = {}
    
    if requirements_path.exists():
        with open(requirements_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    # Parsear formato: package==version o package[extra]==version
                    match = re.match(r'^([a-zA-Z0-9_-]+(?:\[[^\]]+\])?)==([^\s]+)', line)
                    if match:
                        package = match.group(1)
                        version = match.group(2)
                        dependencies[package] = version
    return dependencies

def read_package_json():
    """Lee las dependencias del frontend desde package.json"""
    package_path = Path(__file__).parent.parent / "frontend" / "package.json"
    dependencies = {}
    dev_dependencies = {}
    
    if package_path.exists():
        with open(package_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            dependencies = data.get('dependencies', {})
            dev_dependencies = data.get('devDependencies', {})
    
    return dependencies, dev_dependencies

def update_readme_dependencies_section(readme_path, backend_deps, frontend_deps, frontend_dev_deps):
    """Actualiza la sección de dependencias en el README"""
    with open(readme_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Actualizar dependencias del backend
    backend_section_start = content.find("### Backend (`requirements.txt`)")
    backend_section_end = content.find("### Frontend (`package.json`)")
    
    if backend_section_start != -1 and backend_section_end != -1:
        new_backend_section = "### Backend (`requirements.txt`)\n\n```\n"
        for package, version in sorted(backend_deps.items()):
            new_backend_section += f"{package}=={version}\n"
        new_backend_section += "```\n\n"
        
        content = content[:backend_section_start] + new_backend_section + content[backend_section_end:]
    
    # Actualizar dependencias del frontend
    frontend_section_start = content.find("### Frontend (`package.json`)")
    frontend_section_end = content.find("## 🐳 Docker")
    
    if frontend_section_start != -1 and frontend_section_end != -1:
        new_frontend_section = "### Frontend (`package.json`)\n\n```json\n{\n"
        
        # Dependencies
        new_frontend_section += '  "dependencies": {\n'
        deps_items = []
        for package, version in sorted(frontend_deps.items()):
            deps_items.append(f'    "{package}": "{version}"')
        new_frontend_section += ',\n'.join(deps_items) + '\n'
        new_frontend_section += '  }'
        
        # DevDependencies
        if frontend_dev_deps:
            new_frontend_section += ',\n  "devDependencies": {\n'
            dev_deps_items = []
            for package, version in sorted(frontend_dev_deps.items()):
                dev_deps_items.append(f'    "{package}": "{version}"')
            new_frontend_section += ',\n'.join(dev_deps_items) + '\n'
            new_frontend_section += '  }'
        
        new_frontend_section += '\n}\n```\n\n'
        
        content = content[:frontend_section_start] + new_frontend_section + content[frontend_section_end:]
    
    # Actualizar fecha de última actualización
    date_pattern = r'\*\*Última actualización\*\*: .*'
    new_date = f"**Última actualización**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    content = re.sub(date_pattern, new_date, content)
    
    return content

def main():
    """Función principal"""
    print("🔄 Actualizando dependencias en README.md...")
    
    # Leer dependencias
    backend_deps = read_requirements()
    frontend_deps, frontend_dev_deps = read_package_json()
    
    print(f"📦 Encontradas {len(backend_deps)} dependencias del backend")
    print(f"📦 Encontradas {len(frontend_deps)} dependencias del frontend")
    print(f"📦 Encontradas {len(frontend_dev_deps)} devDependencies del frontend")
    
    # Actualizar README
    readme_path = Path(__file__).parent.parent / "README.md"
    
    if not readme_path.exists():
        print("❌ Error: README.md no encontrado")
        return
    
    updated_content = update_readme_dependencies_section(
        readme_path, backend_deps, frontend_deps, frontend_dev_deps
    )
    
    # Guardar cambios
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print("✅ README.md actualizado exitosamente")
    print(f"📅 Fecha de actualización: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()

