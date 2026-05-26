# Etapa 1: preparar archivos
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# No hay build step — vanilla ES Modules
# Copiamos el proyecto tal cual

# Etapa 2: servir con nginx
FROM nginx:alpine
COPY --from=build /app/index.html        /usr/share/nginx/html/index.html
COPY --from=build /app/js                /usr/share/nginx/html/js
COPY --from=build /app/public            /usr/share/nginx/html/public

# Configuración para SPA: todas las rutas apuntan al index.html
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80