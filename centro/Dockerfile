# Etapa 1: Construir el Frontend (React/Vite)
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
# Copiar dependencias y código del cliente
COPY client/package*.json ./
RUN npm install
COPY client/ ./
# Construir la aplicación para producción
RUN npm run build

# Etapa 2: Construir el Backend y unir ambos
FROM node:20-alpine
WORKDIR /app/server

# Copiar dependencias del servidor
COPY server/package*.json ./
RUN npm install --production

# Copiar el código del servidor
COPY server/ ./

# Traer la versión construida del frontend (React) a una carpeta accesible para el servidor
# No necesitamos moverlo a server/public porque el app.js ya busca en ../../client/dist
# Pero para Docker, la estructura será /app/client/dist
WORKDIR /app
COPY --from=frontend-builder /app/client/dist ./client/dist

# Exponer el puerto del servidor
EXPOSE 3001

# Iniciar la aplicación
WORKDIR /app/server
CMD ["node", "src/app.js"]
