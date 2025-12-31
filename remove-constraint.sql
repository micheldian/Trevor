-- Remove WhatsApp format constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS whatsapp_format;
