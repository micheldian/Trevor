#!/bin/bash

# Script to remove WhatsApp format constraint from database using Docker

echo "🔧 Removing WhatsApp format constraint from database..."

# Execute SQL command in the Docker container
docker exec -i trevor-postgres psql -U trevor_user -d trevor_db <<EOF
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS whatsapp_format;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Constraint removed successfully!"
    echo ""
    echo "You can now create worker profiles with any international WhatsApp number."
else
    echo "❌ Error removing constraint. Make sure Docker container 'trevor-postgres' is running."
    echo "Run: docker ps | grep trevor-postgres"
fi
