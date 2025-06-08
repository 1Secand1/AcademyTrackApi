#!/bin/sh

echo "Waiting for database to be ready..."
sleep 10

echo "Applying database migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec node dist/src/main.js 