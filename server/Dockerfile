FROM node:20-alpine

# Install Docker CLI so the Node.js server can spawn docker run commands (Docker-out-of-Docker)
RUN apk add --no-cache docker-cli

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose the port
EXPOSE 3001

# The server requires the host's docker socket to be mounted to /var/run/docker.sock
CMD ["npm", "start"]
