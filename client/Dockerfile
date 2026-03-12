# Build stage
FROM node:21-slim AS builder
WORKDIR /app

# Copiamos package.json y lock (si lo tienes)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copiamos archivos de configuración necesarios para el build
COPY vite.config.ts .
COPY tailwind.config.ts .
COPY postcss.config.cjs .   
# Si los tienes en /app/client también puedes omitirloss y colocarlos dentro de client/

# Copiamos el código fuente
COPY client ./client
# COPY shared ./shared
COPY attached_assets ./attached_assets

# Ejecutamos build (usará vite.config.ts que apunta root a ./client)
RUN npx vite build

# Runtime stage con nginx
FROM nginx:stable-alpine

# Copiamos los archivos estáticos generados por Vite
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Copiamos nuestra configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5010

CMD ["nginx", "-g", "daemon off;"]