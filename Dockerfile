# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_AUTH_URL

# Set environment variables for build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_AUTH_URL=${VITE_AUTH_URL}

# Build the application
RUN npm run build