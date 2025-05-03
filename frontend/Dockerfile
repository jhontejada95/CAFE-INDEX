# Etapa de construcciu00f3n
FROM node:18-alpine as build

WORKDIR /app

# Copiar archivos de configuracion del proyecto
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY index.html ./

# Instalar dependencias
RUN npm ci

# Copiar el cu00f3digo fuente
COPY ./src ./src
COPY ./public ./public

# Construir la aplicacion
RUN npm run build

# Etapa de produccio
FROM nginx:alpine

# Copiar archivos de configuracion de nginx si fuera necesario
# COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos de la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]