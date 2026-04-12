FROM node:18-alpine

LABEL maintainer="Janusz <jahumac@gmail.com>"
LABEL org.opencontainers.image.title="Train Depot"
LABEL org.opencontainers.image.description="Self-hosted model train collection catalog"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/jahumac/train-depot"

WORKDIR /app

# Copy application files
COPY package.json server.js database.js seed.js start.sh ./
COPY static/ ./static/

# Create data and upload directories
RUN mkdir -p /app/data /app/static/images/uploads \
    && chmod +x start.sh

# Persistent volumes for user data
VOLUME ["/app/data", "/app/static/images/uploads"]

EXPOSE 8005

# Start the server (empty database created automatically on first run)
CMD ["node", "server.js"]
