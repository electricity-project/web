FROM node:alpine AS builder
ENV NODE_ENV production
ENV REACT_APP_API_BASE_URL http://localhost:8084
ENV REACT_APP_API_UPDATE_INTERVAL 60000
WORKDIR /app
COPY ./package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
