# Quickstart

Esta guía ordena los pasos para levantar el proyecto en desarrollo local y con Docker.

## 1. Requisitos previos

- Python 3.8+ (se recomienda 3.11)
- Node 20+ y npm
- Git (para clonar el repositorio)
- (Opcional) Docker y Docker Compose

> Nota: el frontend en Docker usa `node:20-alpine` para construir la aplicación porque Vite requiere Node.js 20.19+ o 22.12+.

El frontend consume datos del backend y renderiza gráficos nativos (SHAP, PCA/clusters, etc.) en lugar de depender de imágenes estáticas.

## 2. Clonar el repositorio

```bash
git clone <repo-url>
cd <repo-folder>
```

Reemplaza `<repo-url>` y `<repo-folder>` con la URL del repositorio y la carpeta local correspondiente.

## 3. Desarrollo local sin Docker

### 3.1 Preparar el backend

```bash
cd api
python -m venv .venv
```

- Windows (PowerShell):

```powershell
. .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

- Linux / macOS (bash):

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

### 3.2 Ejecutar el backend

Desde `api`:

```bash
python run_server.py
```

El backend debería quedar disponible en `http://localhost:8000`.

### 3.3 Preparar y ejecutar el frontend

Abre una nueva terminal y ejecuta desde la raíz del repositorio:

```bash
npm install
```

- Windows (PowerShell):

```powershell
$env:VITE_API_URL = "http://localhost:8000"
npm run dev
```

- Linux / macOS (bash):

```bash
export VITE_API_URL=http://localhost:8000
npm run dev
```

El frontend debería quedar disponible en `http://localhost:3000` o en la URL que muestre Vite.

## 4. Verificar la instalación

- Revisar que el backend responda:

```bash
curl http://localhost:8000/health
```

- Abrir el frontend en el navegador:

`http://localhost:3000`

## 5. Uso de Docker (opcional)

Si prefieres usar contenedores, asegúrate de tener Docker y Docker Compose instalados.

### 5.1 Instalar Docker (opcional)

- Windows: instala Docker Desktop desde https://docs.docker.com/desktop/install/windows-install/
- macOS: instala Docker Desktop desde https://docs.docker.com/desktop/install/mac-install/
- Linux: sigue la guía oficial para tu distribución en https://docs.docker.com/engine/install/

### 5.2 Verificar Docker

```bash
docker --version
docker compose version
```

En Linux, si deseas usar Docker sin `sudo`:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### 5.3 Levantar el proyecto con Docker

Desde la raíz del repositorio:

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

> Importante: cuando accedes al frontend en el navegador, no uses `http://api:8000`.
> Ese host solo existe dentro de la red de Docker. Para la app en tu navegador, la URL correcta del backend local es `http://localhost:8000`.

## 6. Despliegue y configuración de la URL del backend

Si despliegas el frontend como archivos estáticos y necesitas apuntar a otro backend sin reconstruir:

```html
<script>
  window.__API_URL = "https://mi-backend.example.com";
</script>
<script type="module" src="/src/main.jsx"></script>
```

## 7. Notas importantes

- Verifica que los archivos de modelos (`*.joblib`, `*.json`) existan en las rutas esperadas.
- No guardes secretos en texto plano: usa variables de entorno o un gestor de secretos.
- Si el frontend no se conecta al backend, revisa que `VITE_API_URL` apunte correctamente a `http://localhost:8000`.
