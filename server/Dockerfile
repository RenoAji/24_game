FROM node:22-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose the port your Express app runs on
EXPOSE 3000

CMD ["npm", "run", "start"]