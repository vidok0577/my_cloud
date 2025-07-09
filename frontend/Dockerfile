FROM node:22-slim AS build

WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

FROM alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
CMD ["echo", "Frontend build complete"]
