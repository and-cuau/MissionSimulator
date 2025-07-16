
# Stage 1: Build --------------------
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# RUN npm run build # not needed for js server

# Stage 2: Production ---------------

FROM node:18-alpine AS production

WORKDIR /app

# Add tzdata for time zone support
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/America/New_York /etc/localtime && \
    echo "America/New_York" > /etc/timezone

# Only copy production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built app from previous stage
COPY --from=builder /app ./

# Start the server
CMD ["node", "server.js"]
