-- ====================================
-- TREVOR V1 - SEED DATA
-- Données de test pour développement
-- ====================================

-- Nettoyage (pour re-seeding)
TRUNCATE TABLE
    analytics_events,
    notifications,
    reviews,
    matches,
    availability,
    team_members,
    teams,
    jobs,
    profiles,
    users
RESTART IDENTITY CASCADE;

-- ====================================
-- USERS (10 utilisateurs)
-- ====================================

INSERT INTO users (id, email, phone, first_name, last_name, avatar_url, is_verified, phone_verified) VALUES
-- Workers
('a1111111-1111-1111-1111-111111111111', 'jean.dupont@email.fr', '+33612345678', 'Jean', 'Dupont', 'https://i.pravatar.cc/150?img=12', true, true),
('a2222222-2222-2222-2222-222222222222', 'marie.martin@email.fr', '+33623456789', 'Marie', 'Martin', 'https://i.pravatar.cc/150?img=5', true, true),
('a3333333-3333-3333-3333-333333333333', 'pierre.bernard@email.fr', '+33634567890', 'Pierre', 'Bernard', 'https://i.pravatar.cc/150?img=33', true, true),
('a4444444-4444-4444-4444-444444444444', 'sophie.petit@email.fr', '+33645678901', 'Sophie', 'Petit', 'https://i.pravatar.cc/150?img=9', true, true),

-- Team Leads
('b1111111-1111-1111-1111-111111111111', 'thomas.dubois@email.fr', '+33656789012', 'Thomas', 'Dubois', 'https://i.pravatar.cc/150?img=15', true, true),
('b2222222-2222-2222-2222-222222222222', 'claire.lefebvre@email.fr', '+33667890123', 'Claire', 'Lefebvre', 'https://i.pravatar.cc/150?img=20', true, true),

-- Employers
('c1111111-1111-1111-1111-111111111111', 'contact@fermedurocher.fr', '+33388123456', 'François', 'Rocher', 'https://i.pravatar.cc/150?img=51', true, true),
('c2222222-2222-2222-2222-222222222222', 'contact@domainemuller.fr', '+33388234567', 'Hans', 'Müller', 'https://i.pravatar.cc/150?img=52', true, true),
('c3333333-3333-3333-3333-333333333333', 'contact@vignoblealsace.fr', '+33388345678', 'Philippe', 'Weber', 'https://i.pravatar.cc/150?img=53', true, true),

-- Multi-role (worker + employer)
('d1111111-1111-1111-1111-111111111111', 'lucas.schmidt@email.fr', '+33678901234', 'Lucas', 'Schmidt', 'https://i.pravatar.cc/150?img=60', true, true);

-- ====================================
-- PROFILES (13 profils)
-- ====================================

-- Workers (5 profils)
INSERT INTO profiles (id, user_id, profile_type, bio, city, postal_code, skills, experience_years, certifications, whatsapp_number, location, rating_avg, rating_count) VALUES
('p1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'worker',
 'Expérience de 10 ans dans la viticulture. Spécialisé en taille et vendanges.',
 'Strasbourg', '67000', ARRAY['viticulture', 'taille', 'vendanges', 'conduite tracteur'], 10, ARRAY['CACES R372'],
 '+33612345678', ST_SetSRID(ST_MakePoint(7.7521, 48.5734), 4326)::geography, 4.50, 12),

('p2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'worker',
 'Passionnée d''arboriculture fruitière. 5 ans d''expérience en cueillette et tri.',
 'Obernai', '67210', ARRAY['arboriculture', 'cueillette', 'tri', 'conditionnement'], 5, ARRAY[],
 '+33623456789', ST_SetSRID(ST_MakePoint(7.4833, 48.4667), 4326)::geography, 4.80, 8),

('p3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'worker',
 'Maraîcher avec 8 ans d''expérience. Compétences en entretien cultures et récolte.',
 'Haguenau', '67500', ARRAY['maraîchage', 'entretien cultures', 'récolte', 'irrigation'], 8, ARRAY['Certiphyto'],
 '+33634567890', ST_SetSRID(ST_MakePoint(7.7889, 48.8150), 4326)::geography, 4.20, 5),

('p4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'worker',
 'Jeune motivée pour découvrir l''agriculture locale. Première expérience.',
 'Sélestat', '67600', ARRAY['cueillette', 'entretien'], 1, ARRAY[],
 '+33645678901', ST_SetSRID(ST_MakePoint(7.4500, 48.2600), 4326)::geography, 0.00, 0),

('p5555555-5555-5555-5555-555555555555', 'd1111111-1111-1111-1111-111111111111', 'worker',
 'Polyvalent en grande culture et élevage. 6 ans d''expérience.',
 'Molsheim', '67120', ARRAY['grande culture', 'élevage', 'fenaison', 'conduite tracteur'], 6, ARRAY['CACES R482'],
 '+33678901234', ST_SetSRID(ST_MakePoint(7.4931, 48.5436), 4326)::geography, 4.60, 15);

-- Team Leads (2 profils)
INSERT INTO profiles (id, user_id, profile_type, bio, city, postal_code, skills, experience_years, whatsapp_number, location, rating_avg, rating_count) VALUES
('l1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'team_lead',
 'Chef d''équipe avec 15 ans d''expérience. Spécialiste vendanges et arboriculture.',
 'Barr', '67140', ARRAY['management', 'vendanges', 'arboriculture', 'organisation'], 15,
 '+33656789012', ST_SetSRID(ST_MakePoint(7.4500, 48.4083), 4326)::geography, 4.70, 20),

('l2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'team_lead',
 'Responsable d''équipe maraîchage bio. 12 ans dans le secteur.',
 'Saverne', '67700', ARRAY['management', 'maraîchage bio', 'permaculture'], 12,
 '+33667890123', ST_SetSRID(ST_MakePoint(7.3625, 48.7419), 4326)::geography, 4.90, 18);

-- Employers (4 profils)
INSERT INTO profiles (id, user_id, profile_type, company_name, siret, bio, city, postal_code, whatsapp_number, location, rating_avg, rating_count) VALUES
('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'employer',
 'Ferme du Rocher', '12345678901234',
 'Exploitation viticole familiale de 15 hectares. Vins AOC Alsace.',
 'Dambach-la-Ville', '67650', '+33388123456',
 ST_SetSRID(ST_MakePoint(7.4269, 48.3247), 4326)::geography, 4.40, 10),

('e2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'employer',
 'Domaine Müller', '23456789012345',
 'Producteur de fruits (pommes, cerises, prunes) sur 20 hectares.',
 'Traenheim', '67310', '+33388234567',
 ST_SetSRID(ST_MakePoint(7.5167, 48.6333), 4326)::geography, 4.60, 8),

('e3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'employer',
 'Vignoble d''Alsace', '34567890123456',
 'Cave coopérative avec 200 hectares de vignes. Production Grand Cru.',
 'Eguisheim', '68420', '+33388345678',
 ST_SetSRID(ST_MakePoint(7.3069, 48.0419), 4326)::geography, 4.80, 25),

('e4444444-4444-4444-4444-444444444444', 'd1111111-1111-1111-1111-111111111111', 'employer',
 'EARL Schmidt', '45678901234567',
 'Exploitation maraîchère bio et vente directe.',
 'Molsheim', '67120', '+33678901234',
 ST_SetSRID(ST_MakePoint(7.4931, 48.5436), 4326)::geography, 0.00, 0);

-- ====================================
-- TEAMS (2 équipes)
-- ====================================

INSERT INTO teams (id, team_lead_profile_id, name, description, max_members, current_members_count) VALUES
('t1111111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111',
 'Équipe Vendanges Pro', 'Équipe spécialisée vendanges manuelles et mécaniques', 8, 1),

('t2222222-2222-2222-2222-222222222222', 'l2222222-2222-2222-2222-222222222222',
 'Team Maraîchage Bio', 'Équipe dédiée maraîchage biologique', 6, 1);

-- ====================================
-- TEAM_MEMBERS (4 membres)
-- ====================================

INSERT INTO team_members (team_id, worker_profile_id, role) VALUES
('t1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'member'),
('t1111111-1111-1111-1111-111111111111', 'p2222222-2222-2222-2222-222222222222', 'member'),
('t2222222-2222-2222-2222-222222222222', 'p3333333-3333-3333-3333-333333333333', 'assistant_lead'),
('t2222222-2222-2222-2222-222222222222', 'p4444444-4444-4444-4444-444444444444', 'member');

-- ====================================
-- AVAILABILITY (8 disponibilités)
-- ====================================

INSERT INTO availability (profile_id, start_date, end_date, availability_type, days_of_week, hours_per_day) VALUES
-- Workers disponibles
('p1111111-1111-1111-1111-111111111111', '2025-09-01', '2025-10-31', 'available', ARRAY[1,2,3,4,5,6], 8.00),
('p2222222-2222-2222-2222-222222222222', '2025-06-01', '2025-08-31', 'available', ARRAY[1,2,3,4,5], 6.00),
('p3333333-3333-3333-3333-333333333333', '2025-05-01', '2025-09-30', 'available', ARRAY[1,2,3,4,5], 8.00),
('p4444444-4444-4444-4444-444444444444', '2025-07-01', '2025-08-31', 'available', ARRAY[6,7], 4.00),
('p5555555-5555-5555-5555-555555555555', '2025-04-01', '2025-12-31', 'available', ARRAY[1,2,3,4,5], 10.00),

-- Teams disponibles
('t1111111-1111-1111-1111-111111111111', '2025-09-01', '2025-10-15', 'available', ARRAY[1,2,3,4,5,6], 8.00),

-- Indisponibilités
('p1111111-1111-1111-1111-111111111111', '2025-07-15', '2025-07-30', 'unavailable', NULL, NULL);

-- (Note: la 8e sera ajoutée via team insertion trigger)

-- ====================================
-- JOBS (8 offres)
-- ====================================

INSERT INTO jobs (id, employer_profile_id, title, description, job_type, category, required_skills, min_experience_years, workers_needed, city, postal_code, start_date, end_date, hourly_rate_min, hourly_rate_max, status, published_at, location) VALUES

-- Jobs publiés (actifs)
('j1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111',
 'Vendangeurs H/F - Domaine AOC',
 'Recherche vendangeurs pour récolte raisins blancs (Riesling, Gewurztraminer). Équipe dynamique, ambiance conviviale. Expérience en viticulture appréciée.',
 'seasonal', 'vendanges', ARRAY['viticulture', 'vendanges'], 2, 6,
 'Dambach-la-Ville', '67650', '2025-09-15', '2025-10-10', 11.50, 13.00, 'published', NOW() - INTERVAL '2 days',
 ST_SetSRID(ST_MakePoint(7.4269, 48.3247), 4326)::geography),

('j2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222',
 'Cueillette de cerises',
 'Cueillette manuelle cerises variété Burlat. Formation sur place. Débutants acceptés. Possibilité hébergement.',
 'temporary', 'cueillette', ARRAY['cueillette', 'arboriculture'], 0, 10,
 'Traenheim', '67310', '2025-06-10', '2025-07-05', 11.00, 12.00, 'published', NOW() - INTERVAL '5 days',
 ST_SetSRID(ST_MakePoint(7.5167, 48.6333), 4326)::geography),

('j3333333-3333-3333-3333-333333333333', 'e3333333-3333-3333-3333-333333333333',
 'Chef d''équipe vendanges',
 'Recherche chef d''équipe expérimenté pour encadrer 15 vendangeurs. Permis B requis. Logement fourni.',
 'seasonal', 'vendanges', ARRAY['management', 'vendanges', 'conduite tracteur'], 5, 1,
 'Eguisheim', '68420', '2025-09-20', '2025-10-20', 15.00, 18.00, 'published', NOW() - INTERVAL '1 day',
 ST_SetSRID(ST_MakePoint(7.3069, 48.0419), 4326)::geography),

('j4444444-4444-4444-4444-444444444444', 'e4444444-4444-4444-4444-444444444444',
 'Maraîcher polyvalent H/F',
 'Recherche maraîcher pour entretien cultures bio (tomates, courgettes, salades). CDD 6 mois renouvelable.',
 'full_time', 'maraîchage', ARRAY['maraîchage', 'entretien cultures', 'irrigation'], 3, 2,
 'Molsheim', '67120', '2025-05-01', '2025-10-31', 12.50, 14.00, 'published', NOW() - INTERVAL '7 days',
 ST_SetSRID(ST_MakePoint(7.4931, 48.5436), 4326)::geography),

('j5555555-5555-5555-5555-555555555555', 'e1111111-1111-1111-1111-111111111111',
 'Taille de vigne hiver',
 'Taille manuelle vignes Riesling et Pinot Gris. Expérience obligatoire. CACES apprécié.',
 'part_time', 'taille', ARRAY['viticulture', 'taille'], 3, 4,
 'Dambach-la-Ville', '67650', '2026-01-15', '2026-03-15', 13.00, 15.00, 'published', NOW() - INTERVAL '10 days',
 ST_SetSRID(ST_MakePoint(7.4269, 48.3247), 4326)::geography),

-- Jobs draft
('j6666666-6666-6666-6666-666666666666', 'e2222222-2222-2222-2222-222222222222',
 'Récolte pommes automne',
 'Cueillette pommes Golden et Gala. Dates à confirmer.',
 'seasonal', 'cueillette', ARRAY['cueillette', 'arboriculture'], 0, 8,
 'Traenheim', '67310', '2025-09-01', '2025-10-15', 11.00, 12.00, 'draft', NULL,
 ST_SetSRID(ST_MakePoint(7.5167, 48.6333), 4326)::geography),

-- Jobs closed
('j7777777-7777-7777-7777-777777777777', 'e3333333-3333-3333-3333-333333333333',
 'Vendanges 2024 - TERMINÉ',
 'Vendanges terminées, merci aux participants.',
 'seasonal', 'vendanges', ARRAY['vendanges'], 0, 20,
 'Eguisheim', '68420', '2024-09-15', '2024-10-10', 11.50, 12.50, 'closed', NOW() - INTERVAL '90 days',
 ST_SetSRID(ST_MakePoint(7.3069, 48.0419), 4326)::geography);

-- ====================================
-- MATCHES (10 matches)
-- ====================================

INSERT INTO matches (id, job_id, worker_profile_id, team_id, initiated_by, status, match_score, match_reasons, employer_message, worker_message, accepted_at) VALUES

-- Matches acceptés
('m1111111-1111-1111-1111-111111111111', 'j1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', NULL,
 'employer', 'accepted', 87.50, '{"skills": 3, "distance_km": 2.5, "experience": "excellent"}',
 'Votre profil correspond parfaitement. Quand pouvez-vous commencer ?',
 'Disponible dès le 15 septembre !', NOW() - INTERVAL '1 day'),

('m2222222-2222-2222-2222-222222222222', 'j1111111-1111-1111-1111-111111111111', NULL, 't1111111-1111-1111-1111-111111111111',
 'system', 'accepted', 92.00, '{"skills": 4, "distance_km": 15, "team_size": 3}',
 'Votre équipe a une excellente réputation. Intéressés ?',
 'Équipe de 3 personnes prête à intervenir.', NOW() - INTERVAL '2 hours'),

('m3333333-3333-3333-3333-333333333333', 'j2222222-2222-2222-2222-222222222222', 'p2222222-2222-2222-2222-222222222222', NULL,
 'worker', 'accepted', 78.00, '{"skills": 2, "distance_km": 8, "rating": 4.8}',
 NULL, 'Passionnée par l''arboriculture, je postule !', NOW() - INTERVAL '3 days'),

('m4444444-4444-4444-4444-444444444444', 'j4444444-4444-4444-4444-444444444444', 'p3333333-3333-3333-3333-333333333333', NULL,
 'employer', 'accepted', 85.00, '{"skills": 4, "distance_km": 25, "certifications": 1}',
 'Votre certification Certiphyto est un plus. Rendez-vous lundi ?',
 'Parfait, à lundi 8h !', NOW() - INTERVAL '5 days'),

-- Matches pending
('m5555555-5555-5555-5555-555555555555', 'j3333333-3333-3333-3333-333333333333', 'l1111111-1111-1111-1111-111111111111', NULL,
 'system', 'pending', 95.00, '{"skills": 5, "distance_km": 12, "experience": 15, "rating": 4.7}',
 'Profil idéal pour chef d''équipe. Intéressé ?', NULL, NULL),

('m6666666-6666-6666-6666-666666666666', 'j5555555-5555-5555-5555-555555555555', 'p1111111-1111-1111-1111-111111111111', NULL,
 'worker', 'pending', 88.00, '{"skills": 2, "distance_km": 2.5, "experience": 10}',
 NULL, 'Disponible pour la taille cet hiver.', NULL),

('m7777777-7777-7777-7777-777777777777', 'j2222222-2222-2222-2222-222222222222', 'p4444444-4444-4444-4444-444444444444', NULL,
 'worker', 'pending', 65.00, '{"skills": 1, "distance_km": 45, "experience": 1}',
 NULL, 'Motivée pour apprendre la cueillette !', NULL),

-- Matches rejected
('m8888888-8888-8888-8888-888888888888', 'j4444444-4444-4444-4444-444444444444', 'p4444444-4444-4444-4444-444444444444', NULL,
 'employer', 'rejected', 45.00, '{"skills": 0, "distance_km": 55, "experience": 1}',
 'Profil ne correspond pas aux critères requis.', NULL, NULL),

-- Match expiré
('m9999999-9999-9999-9999-999999999999', 'j1111111-1111-1111-1111-111111111111', 'p5555555-5555-5555-5555-555555555555', NULL,
 'system', 'expired', 72.00, '{"skills": 2, "distance_km": 30}',
 'Offre intéressante ?', NULL, NULL);

-- ====================================
-- REVIEWS (8 avis)
-- ====================================

INSERT INTO reviews (match_id, reviewer_profile_id, reviewed_profile_id, rating, title, comment, punctuality_rating, quality_rating, communication_rating) VALUES

-- Employer → Worker reviews
('m1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111',
 5, 'Travailleur exceptionnel',
 'Jean a effectué un travail remarquable lors des vendanges. Ponctuel, efficace et agréable. Je recommande vivement !',
 5, 5, 5),

('m3333333-3333-3333-3333-333333333333', 'e2222222-2222-2222-2222-222222222222', 'p2222222-2222-2222-2222-222222222222',
 5, 'Parfaite pour la cueillette',
 'Marie est très professionnelle et rapide. Excellent travail de tri et conditionnement.',
 5, 5, 5),

('m4444444-4444-4444-4444-444444444444', 'e4444444-4444-4444-4444-444444444444', 'p3333333-3333-3333-3333-333333333333',
 4, 'Bon travailleur',
 'Pierre connaît bien son métier. Quelques retards mais qualité de travail au rendez-vous.',
 3, 5, 4),

-- Worker → Employer reviews
('m1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111',
 5, 'Excellent employeur',
 'Conditions de travail impeccables, équipe sympathique. Ferme bien organisée. Je reviendrai !',
 5, 5, 5),

('m3333333-3333-3333-3333-333333333333', 'p2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222',
 5, 'Top employeur',
 'Très bonne expérience. Matériel de qualité, pauses respectées, ambiance conviviale.',
 5, 5, 5),

('m4444444-4444-4444-4444-444444444444', 'p3333333-3333-3333-3333-333333333333', 'e4444444-4444-4444-4444-444444444444',
 4, 'Bonne exploitation bio',
 'Travail intéressant en maraîchage bio. Aurait apprécié plus de communication sur les tâches.',
 4, 5, 3),

-- Team reviews
('m2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111',
 5, 'Équipe au top',
 'L''équipe de Thomas est incroyablement efficace. Travail de qualité, zéro souci. Recommandation ++',
 5, 5, 5),

('m2222222-2222-2222-2222-222222222222', 'l1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111',
 4, 'Bon domaine viticole',
 'Belle expérience dans un domaine familial. Organisation parfois à améliorer.',
 4, 5, 4);

-- ====================================
-- NOTIFICATIONS (10 notifications)
-- ====================================

INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id, is_read) VALUES

-- Notifications non lues
('a1111111-1111-1111-1111-111111111111', 'new_review', 'Nouvel avis reçu',
 'Ferme du Rocher a laissé un avis 5★ sur votre profil', 'review', NULL, false),

('b1111111-1111-1111-1111-111111111111', 'match_request', 'Nouveau match suggéré',
 'Votre équipe correspond à l''offre "Chef d''équipe vendanges"', 'match', 'm5555555-5555-5555-5555-555555555555', false),

('c1111111-1111-1111-1111-111111111111', 'match_accepted', 'Match accepté !',
 'Jean Dupont a accepté votre offre de vendanges', 'match', 'm1111111-1111-1111-1111-111111111111', false),

-- Notifications lues
('a2222222-2222-2222-2222-222222222222', 'match_accepted', 'Votre candidature est acceptée',
 'Domaine Müller a accepté votre candidature pour la cueillette de cerises', 'match', 'm3333333-3333-3333-3333-333333333333', true),

('a3333333-3333-3333-3333-333333333333', 'new_review', 'Avis reçu',
 'EARL Schmidt vous a laissé un avis 4★', 'review', NULL, true),

('c2222222-2222-2222-2222-222222222222', 'system', 'Bienvenue sur Trevor',
 'Votre compte employeur est maintenant actif. Commencez à publier vos offres !', NULL, NULL, true),

('a4444444-4444-4444-4444-444444444444', 'match_rejected', 'Candidature non retenue',
 'Votre candidature pour "Maraîcher polyvalent" n''a pas été retenue cette fois.', 'match', 'm8888888-8888-8888-8888-888888888888', true),

('b2222222-2222-2222-2222-222222222222', 'team_invite', 'Nouveau membre dans votre équipe',
 'Pierre Bernard a rejoint votre Team Maraîchage Bio', 'team', 't2222222-2222-2222-2222-222222222222', true);

-- ====================================
-- ANALYTICS_EVENTS (15 événements)
-- ====================================

INSERT INTO analytics_events (user_id, event_type, event_data, ip_address) VALUES

-- Job views
('a1111111-1111-1111-1111-111111111111', 'job_view', '{"job_id": "j1111111-1111-1111-1111-111111111111", "source": "search", "query": "vendanges"}', '87.98.154.23'),
('a2222222-2222-2222-2222-222222222222', 'job_view', '{"job_id": "j2222222-2222-2222-2222-222222222222", "source": "homepage"}', '88.120.45.67'),
('a3333333-3333-3333-3333-333333333333', 'job_view', '{"job_id": "j4444444-4444-4444-4444-444444444444", "source": "search", "query": "maraîchage"}', '92.134.78.12'),

-- Profile views
('c1111111-1111-1111-1111-111111111111', 'profile_view', '{"profile_id": "p1111111-1111-1111-1111-111111111111", "viewer_type": "employer"}', '87.98.154.23'),
('c2222222-2222-2222-2222-222222222222', 'profile_view', '{"profile_id": "p2222222-2222-2222-2222-222222222222", "viewer_type": "employer"}', '88.120.45.67'),

-- Match created
(NULL, 'match_created', '{"match_id": "m1111111-1111-1111-1111-111111111111", "match_score": 87.5, "initiated_by": "employer"}', '87.98.154.23'),
(NULL, 'match_created', '{"match_id": "m2222222-2222-2222-2222-222222222222", "match_score": 92.0, "initiated_by": "system"}', '10.0.0.1'),

-- Search queries
('a1111111-1111-1111-1111-111111111111', 'search', '{"query": "vendanges strasbourg", "results_count": 3}', '87.98.154.23'),
('a2222222-2222-2222-2222-222222222222', 'search', '{"query": "cueillette", "results_count": 5}', '88.120.45.67'),
('a4444444-4444-4444-4444-444444444444', 'search', '{"query": "débutant accepté", "results_count": 2}', '92.134.78.12'),

-- WhatsApp clicks
('a1111111-1111-1111-1111-111111111111', 'whatsapp_click', '{"employer_id": "e1111111-1111-1111-1111-111111111111", "job_id": "j1111111-1111-1111-1111-111111111111"}', '87.98.154.23'),
('a2222222-2222-2222-2222-222222222222', 'whatsapp_click', '{"employer_id": "e2222222-2222-2222-2222-222222222222", "job_id": "j2222222-2222-2222-2222-222222222222"}', '88.120.45.67');

-- ====================================
-- VÉRIFICATIONS SEED
-- ====================================

-- Vérifier les counts
DO $$
BEGIN
    RAISE NOTICE 'SEED DATA LOADED:';
    RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'Profiles: %', (SELECT COUNT(*) FROM profiles);
    RAISE NOTICE 'Teams: %', (SELECT COUNT(*) FROM teams);
    RAISE NOTICE 'Team Members: %', (SELECT COUNT(*) FROM team_members);
    RAISE NOTICE 'Availability: %', (SELECT COUNT(*) FROM availability);
    RAISE NOTICE 'Jobs: %', (SELECT COUNT(*) FROM jobs);
    RAISE NOTICE 'Matches: %', (SELECT COUNT(*) FROM matches);
    RAISE NOTICE 'Reviews: %', (SELECT COUNT(*) FROM reviews);
    RAISE NOTICE 'Notifications: %', (SELECT COUNT(*) FROM notifications);
    RAISE NOTICE 'Analytics Events: %', (SELECT COUNT(*) FROM analytics_events);
END $$;

-- Vérifier ratings calculés (via triggers)
SELECT
    p.user_id,
    u.first_name || ' ' || u.last_name as name,
    p.profile_type,
    p.rating_avg,
    p.rating_count
FROM profiles p
JOIN users u ON u.id = p.user_id
WHERE p.rating_count > 0
ORDER BY p.rating_avg DESC;

-- Vérifier team members count (via triggers)
SELECT
    t.name,
    t.max_members,
    t.current_members_count,
    COUNT(tm.id) as actual_count
FROM teams t
LEFT JOIN team_members tm ON tm.team_id = t.id AND tm.is_active = true
GROUP BY t.id;

-- Vérifier jobs workers_matched (via triggers)
SELECT
    j.title,
    j.workers_needed,
    j.workers_matched,
    COUNT(m.id) FILTER (WHERE m.status = 'accepted') as actual_matched
FROM jobs j
LEFT JOIN matches m ON m.job_id = j.id
GROUP BY j.id
ORDER BY j.created_at DESC;
