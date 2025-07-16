FROM node:18-alpine AS build

WORKDIR /app


COPY package.json package-lock.json* ./ 
#  was:   COPY package*.json ./


RUN npm install --legacy-peer-deps
# was:  RUN npm install

COPY . .  
#node modules in in docker ignore, so won't get overwritten

RUN npm run build

FROM nginx:stable-alpine 
#nginx by default serves traffic on port 80

# Add tzdata for time zone support
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/America/New_York /etc/localtime && \
    echo "America/New_York" > /etc/timezone


COPY --from=build /app/dist /usr/share/nginx/html
# vite outputs static files to dist not build. app/build was causing error 
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
# If build uses environment vars, consider how to inject them properly


#   frontend: 
#     build: ./client
#     ports:
#       - "3001:3000" 
#     depends_on:
#       - backend
#     networks:
#       - frontend
#     labels:
#       - "traefik.http.routers.frontend.rule=Host(`frontend.localhost`)"
#       - "traefik.http.routers.frontend.entrypoints=http"