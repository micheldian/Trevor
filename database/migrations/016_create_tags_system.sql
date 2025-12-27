-- ====================================
-- Migration 016: Create Tags System
-- Tags with aliases for improved search
-- ====================================

-- Create tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Tag name (canonical form)
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,

    -- Category for organization
    category VARCHAR(50),  -- 'culture', 'skill', 'certification', 'equipment', 'other'

    -- Description
    description TEXT,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Usage statistics
    usage_count INTEGER NOT NULL DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT tag_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT tag_slug_not_empty CHECK (LENGTH(TRIM(slug)) > 0)
);

-- Create tag_aliases table (for variations like "pommes" -> "pomme")
CREATE TABLE tag_aliases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- The canonical tag this alias points to
    tag_id UUID NOT NULL,

    -- Alias name (variation)
    alias VARCHAR(100) NOT NULL UNIQUE,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign keys
    CONSTRAINT fk_tag_aliases_tag
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT alias_not_empty CHECK (LENGTH(TRIM(alias)) > 0)
);

-- Indexes for performance
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_category ON tags(category) WHERE category IS NOT NULL;
CREATE INDEX idx_tags_active ON tags(is_active) WHERE is_active = true;
CREATE INDEX idx_tags_usage ON tags(usage_count DESC);

CREATE INDEX idx_tag_aliases_alias ON tag_aliases(alias);
CREATE INDEX idx_tag_aliases_tag ON tag_aliases(tag_id);
CREATE INDEX idx_tag_aliases_active ON tag_aliases(is_active) WHERE is_active = true;

-- Full-text search index on tags
CREATE INDEX idx_tags_name_search ON tags USING gin(to_tsvector('french', name));
CREATE INDEX idx_tag_aliases_alias_search ON tag_aliases USING gin(to_tsvector('french', alias));

-- Function to auto-generate slug from name
CREATE OR REPLACE FUNCTION generate_tag_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Convert to lowercase, replace spaces with hyphens, remove special chars
    NEW.slug := regexp_replace(
        lower(unaccent(NEW.name)),
        '[^a-z0-9]+',
        '-',
        'g'
    );
    -- Remove leading/trailing hyphens
    NEW.slug := trim(both '-' from NEW.slug);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug
CREATE TRIGGER trigger_generate_tag_slug
    BEFORE INSERT OR UPDATE OF name ON tags
    FOR EACH ROW
    EXECUTE FUNCTION generate_tag_slug();

-- Function to increment tag usage count
CREATE OR REPLACE FUNCTION increment_tag_usage(tag_name VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE tags
    SET usage_count = usage_count + 1
    WHERE name = tag_name OR id IN (
        SELECT tag_id FROM tag_aliases WHERE alias = tag_name
    );
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE tags IS 'Canonical tags for search and categorization';
COMMENT ON TABLE tag_aliases IS 'Tag aliases for variations (e.g., "pommes" -> "pomme")';
COMMENT ON COLUMN tags.name IS 'Canonical tag name (e.g., "pomme")';
COMMENT ON COLUMN tags.slug IS 'URL-friendly version of tag name (auto-generated)';
COMMENT ON COLUMN tags.category IS 'Category: culture, skill, certification, equipment, other';
COMMENT ON COLUMN tags.usage_count IS 'Number of times this tag has been used';
COMMENT ON COLUMN tag_aliases.alias IS 'Variation of the canonical tag (e.g., "pommes")';

-- Insert common agricultural tags
INSERT INTO tags (name, category, description) VALUES
    -- Cultures
    ('pomme', 'culture', 'Culture de pommes'),
    ('poire', 'culture', 'Culture de poires'),
    ('cerise', 'culture', 'Culture de cerises'),
    ('prune', 'culture', 'Culture de prunes'),
    ('raisin', 'culture', 'Culture de raisins / viticulture'),
    ('houblon', 'culture', 'Culture de houblon'),
    ('maïs', 'culture', 'Culture de maïs'),
    ('blé', 'culture', 'Culture de blé'),
    ('orge', 'culture', 'Culture d''orge'),
    ('légumes', 'culture', 'Cultures maraîchères'),

    -- Compétences
    ('cueillette', 'skill', 'Récolte manuelle de fruits/légumes'),
    ('taille', 'skill', 'Taille d''arbres et vignes'),
    ('plantation', 'skill', 'Plantation de cultures'),
    ('irrigation', 'skill', 'Gestion de l''irrigation'),
    ('traitement', 'skill', 'Application de traitements phytosanitaires'),
    ('conduite', 'skill', 'Conduite d''engins agricoles'),
    ('tri', 'skill', 'Tri et conditionnement'),

    -- Certifications
    ('caces', 'certification', 'Certificat d''aptitude à la conduite en sécurité'),
    ('phyto', 'certification', 'Certificat phytosanitaire'),
    ('bio', 'certification', 'Certification agriculture biologique'),

    -- Équipement
    ('tracteur', 'equipment', 'Conduite de tracteur'),
    ('moissonneuse', 'equipment', 'Conduite de moissonneuse-batteuse'),
    ('pulvérisateur', 'equipment', 'Utilisation de pulvérisateur')
ON CONFLICT DO NOTHING;

-- Insert common aliases
INSERT INTO tag_aliases (tag_id, alias) VALUES
    -- Plurals
    ((SELECT id FROM tags WHERE name = 'pomme'), 'pommes'),
    ((SELECT id FROM tags WHERE name = 'poire'), 'poires'),
    ((SELECT id FROM tags WHERE name = 'cerise'), 'cerises'),
    ((SELECT id FROM tags WHERE name = 'prune'), 'prunes'),
    ((SELECT id FROM tags WHERE name = 'légume'), 'légumes'),

    -- Variations
    ((SELECT id FROM tags WHERE name = 'raisin'), 'vignoble'),
    ((SELECT id FROM tags WHERE name = 'raisin'), 'vigne'),
    ((SELECT id FROM tags WHERE name = 'raisin'), 'viticulture'),
    ((SELECT id FROM tags WHERE name = 'cueillette'), 'récolte'),
    ((SELECT id FROM tags WHERE name = 'cueillette'), 'ramassage'),
    ((SELECT id FROM tags WHERE name = 'taille'), 'élagage'),
    ((SELECT id FROM tags WHERE name = 'traitement'), 'pulvérisation'),
    ((SELECT id FROM tags WHERE name = 'conduite'), 'chauffeur'),
    ((SELECT id FROM tags WHERE name = 'conduite'), 'conducteur')
ON CONFLICT DO NOTHING;
