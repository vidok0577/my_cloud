FROM node:22-slim AS build

WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn 
COPY . .
RUN yarn build

FROM nginx:1.29-alpine-slim
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
