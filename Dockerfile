FROM node:20-alpine3.21

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5000

CMD ["npm", "run", "prd"]
