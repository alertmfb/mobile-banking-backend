# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

ARG NODE_VERSION=20.10.0

FROM node:${NODE_VERSION}-alpine as base

# Install dependencies for Prisma and PostgreSQL
RUN apk add --no-cache openssl postgresql-client

# Set the working directory inside the container
WORKDIR /.

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema files
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application files into the container
COPY . .

# Build the application
RUN npm run build

# Expose the port that your NestJS application listens on
EXPOSE 3000

# Define the command to run migrations and start the application
CMD npm run prod:deploy
