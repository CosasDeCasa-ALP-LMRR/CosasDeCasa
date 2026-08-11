FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

# Se agrega --host para que escuche en todas las interfaces dentro del contenedor
ENV HOST=0.0.0.0
CMD ["npm", "run", "dev", "--", "--host"]
