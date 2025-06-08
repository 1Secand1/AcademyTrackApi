FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Set temporary DATABASE_URL for Prisma generate
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/academytrack?schema=public"

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Make the entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["./docker-entrypoint.sh"] 