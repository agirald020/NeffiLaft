# Build stage (Se mantiene igual, solo ajustamos la salida)
FROM node:21-slim AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY vite.config.ts ./
COPY client ./client
COPY shared ./shared
COPY attached_assets ./attached_assets
RUN npx vite build

# Runtime stage - CAMBIAMOS A NGINX
FROM nginx:stable-alpine

# Copiamos los archivos estáticos generados por Vite
# Ajusta la ruta si Vite los deja en /app/client/dist
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Copiamos nuestra configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5010

CMD ["nginx", "-g", "daemon off;"]