-- Migration 032: Update jobs_search_vector_trigger to use 'culture' instead of 'category'

CREATE OR REPLACE FUNCTION jobs_search_vector_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('french', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('french', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('french', coalesce(NEW.culture, '')), 'C') ||
        setweight(to_tsvector('french', coalesce(NEW.city, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
