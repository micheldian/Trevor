#!/bin/bash
# Run all migrations in order

set -e

MIGRATIONS_DIR="database/migrations"
CONTAINER=$(docker ps -qf "name=postgres")

if [ -z "$CONTAINER" ]; then
  echo "Error: PostgreSQL container not found"
  exit 1
fi

echo "Running migrations..."

for migration in $(ls -1 $MIGRATIONS_DIR/*.sql | sort); do
  echo "Applying: $(basename $migration)"
  cat "$migration" | docker exec -i $CONTAINER psql -U trevor_user -d trevor_db
  if [ $? -eq 0 ]; then
    echo "✓ $(basename $migration) applied successfully"
  else
    echo "✗ $(basename $migration) failed"
    exit 1
  fi
  echo ""
done

echo "All migrations completed!"
