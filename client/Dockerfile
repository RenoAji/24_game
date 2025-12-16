# Stage 1: Build Vue App
FROM node:22-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy our custom nginx config (created in next step)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]