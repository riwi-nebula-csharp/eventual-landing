# Etapa 1: compilar Tailwind
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: servir con nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html