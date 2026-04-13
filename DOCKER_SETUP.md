# Docker Setup Guide

## Requisitos
- Docker Desktop instalado
- Docker Compose

## Para compilar y ejecutar con Docker Compose:

```bash
# Construir las imágenes
docker-compose build

# Executar los contenedores
docker-compose up

# Ejecutar en background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener los contenedores
docker-compose down
```

## Puertos
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080

## Archivos Docker

### Backend (backend/Dockerfile)
- **Base image**: maven:3.9.0 + eclipse-temurin-17
- **Build**: Maven compilation
- **Runtime**: Java 17 JRE
- **Port**: 8080

### Frontend (client/Dockerfile)
- **Base image**: node:20-alpine
- **Build**: npm build + Vite
- **Runtime**: Serve
- **Port**: 3000

## Variables de Entorno
Copiar `.env.example` a `.env` y ajustar según necesidad:

```bash
cp .env.example .env
```

## Solución de problemas

### Si los contenedores no se inician:
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Para reconstruir imágenes sin caché:
```bash
docker-compose build --no-cache
```

### Para limpiar todo:
```bash
docker-compose down -v
```
