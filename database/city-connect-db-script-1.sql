-- =============================================================
--  DATABASE CREATION SCRIPT — PostgreSQL (Aiven compatible)
--  Project: Municipal Citizen Services Platform
--  Media storage: Backblaze B2 (all file fields stored as URLs)
--  Generated from: E-A diagram + Class diagram
-- =============================================================

-- ─────────────────────────────────────────────
--  EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================
--  1. CORE USER & AUTH
-- =============================================================

-- Base user table (shared by all roles)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cin             INTEGER         UNIQUE NOT NULL,
    first_name       VARCHAR(255)    NOT NULL,
    last_name       VARCHAR(255)    NOT NULL,
    email           VARCHAR(255)    UNIQUE NOT NULL,
    password        VARCHAR(255)    NOT NULL,
    adresse         VARCHAR(255),
    telephone       VARCHAR(50),
    date_naissance  DATE,
    role            VARCHAR(50)     NOT NULL
                        CHECK (role IN ('citoyen', 'prestataire', 'admin')),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Citoyen sub-profile  (inherits from users via TPT)
/*CREATE TABLE citoyen (
    user_id         INTEGER         PRIMARY KEY
                        REFERENCES users(id) ON DELETE CASCADE,
    adresse         VARCHAR(255),
    telephone       VARCHAR(50),
    date_naissance  DATE
);*/

-- Prestataire sub-profile
CREATE TABLE prestataire (
    user_id         UUID         PRIMARY KEY
                        REFERENCES users(id) ON DELETE CASCADE,
    specialite      VARCHAR(255)
);

-- Admin sub-profile
CREATE TABLE admin (
    user_id         UUID         PRIMARY KEY
                        REFERENCES users(id) ON DELETE CASCADE
);

-- Authentication sessions (JWT / token based)
CREATE TABLE auth_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token           TEXT            NOT NULL,
    expiration_date TIMESTAMP       NOT NULL,
    user_id         UUID         NOT NULL
                        REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Notifications sent to users
CREATE TABLE notification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message         TEXT            NOT NULL,
    date            TIMESTAMP       NOT NULL DEFAULT NOW(),
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    user_id         UUID         NOT NULL
                        REFERENCES users(id) ON DELETE CASCADE
);


-- =============================================================
--  2. MUNICIPALITY & RELATED ENTITIES
-- =============================================================

CREATE TABLE municipalite (
    id              SERIAL          PRIMARY KEY,
    nom             VARCHAR(255)    NOT NULL
);

-- Service schedule (horaire service)
CREATE TABLE horaire_service (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(100),
    nom             VARCHAR(255),
    date_deb        DATE,
    date_fin        DATE,
    jour            VARCHAR(50),
    municipalite_id INTEGER
                        REFERENCES municipalite(id) ON DELETE SET NULL
);


-- News / Announcements published by municipality
CREATE TABLE news (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(255)    UNIQUE NOT NULL,
    author          VARCHAR(255),
    date            TIMESTAMP       NOT NULL DEFAULT NOW(),
    badges          TEXT[]          NOT NULL DEFAULT '{}',    -- e.g. ARRAY['urgent','event']
    hero_img        TEXT,                                     -- Backblaze B2 URL
    hero_title      VARCHAR(255),
    hero_subtitle   VARCHAR(255),
    municipalite_id INTEGER
                        REFERENCES municipalite(id) ON DELETE SET NULL
);

-- Sub-articles within a news post  (subArticles: Article[])
CREATE TABLE news_article (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id         UUID            NOT NULL
                        REFERENCES news(id) ON DELETE CASCADE,
    position        SMALLINT        NOT NULL DEFAULT 0,       -- preserves order of subArticles[]
    title           VARCHAR(255)    NOT NULL,
    content         TEXT            NOT NULL,
    media_url       TEXT,                                     -- Backblaze B2 URL (optional)
    media_type      VARCHAR(100)                              -- image/jpeg, video/mp4 … (optional)
);

-- Municipal services offered
CREATE TABLE service (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(100),
    name             VARCHAR(255),
    badges          VARCHAR(255),
    description     TEXT,
    requirements    TEXT,
    municipalite_id INTEGER
                        REFERENCES municipalite(id) ON DELETE SET NULL
);


-- =============================================================
--  3. SIGNALEMENT / PLAINTE  (Citizen complaints)
-- =============================================================

-- Complaint categories
CREATE TABLE plainte_categorie (
    id              SERIAL          PRIMARY KEY,
    type            VARCHAR(100)    NOT NULL
);

-- Signalement = Plainte from the E-A diagram
CREATE TABLE plainte (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description     TEXT,
    status          VARCHAR(50)     NOT NULL DEFAULT 'en_attente'
                        CHECK (status IN ('en_attente', 'en_cours', 'resolu', 'rejete')),
    date_creation   TIMESTAMP       NOT NULL DEFAULT NOW(),
    localisation    VARCHAR(255),
    user_id         UUID
                        REFERENCES users(id) ON DELETE SET NULL,
    categorie_id    INTEGER
                        REFERENCES plainte_categorie(id) ON DELETE SET NULL
);

-- Media attachments for a signalement
-- file_url → Backblaze B2 URL
CREATE TABLE plainte_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_url        TEXT            NOT NULL,   -- Backblaze B2 URL
    file_type       VARCHAR(100),               -- image/jpeg, video/mp4, application/pdf …
    plainte_id  UUID         NOT NULL
                        REFERENCES plainte(id) ON DELETE CASCADE
);

-- Official response to a signalement
CREATE TABLE plainte_reponse (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expeditaire     VARCHAR(255),
    recepteur       VARCHAR(255),
    contenu         TEXT,
    date_reponse    TIMESTAMP       NOT NULL DEFAULT NOW(),
    plainte_id  UUID         NOT NULL
                        REFERENCES plainte(id) ON DELETE CASCADE
);


-- =============================================================
--  4. SERVICE REQUESTS (Demande de service)
-- =============================================================

-- Main service request (Demande / DemandeService)
CREATE TABLE demande_service (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(100),
    status          VARCHAR(50)     NOT NULL DEFAULT 'en_attente'
                        CHECK (status IN ('en_attente', 'en_cours', 'approuvee', 'rejetee', 'terminee')),
    date_creation   TIMESTAMP       NOT NULL DEFAULT NOW(),
    upload_date     TIMESTAMP,
    description     TEXT,
    cin             INTEGER,                    -- citizen CIN snapshot at time of request
    user_id         UUID
                        REFERENCES users(id) ON DELETE SET NULL,
    service_id      UUID
                        REFERENCES service(id) ON DELETE SET NULL
);

-- Generated certificate linked to an approved demande (0..1 per demande)
CREATE TABLE certificat_service (
    id              SERIAL          PRIMARY KEY,
    type            VARCHAR(100),
    date_generation TIMESTAMP       NOT NULL DEFAULT NOW(),
    file_url        TEXT,
    demande_id      UUID         UNIQUE NOT NULL
                        REFERENCES demande_service(id) ON DELETE CASCADE
);

-- Documents / files attached to a demande or a signalement
-- file_url → Backblaze B2 URL  (replaces the 'link' / 'path' columns in diagrams)
CREATE TABLE demande_service_document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_url        TEXT            NOT NULL,   -- Backblaze B2 URL
    file_type       VARCHAR(100),               -- image/jpeg, video/mp4, application/pdf …
    nom             VARCHAR(255),
    taille          VARCHAR(100),               -- stored as string e.g. "2.4 MB"
    demande_id      UUID
                        REFERENCES demande_service(id) ON DELETE CASCADE,
    /*signalement_id  INTEGER
                        REFERENCES signalement(id) ON DELETE CASCADE,
    -- A file must belong to at least one parent
    CONSTRAINT fichier_parent_check CHECK (
        demande_id IS NOT NULL OR signalement_id IS NOT NULL
    )*/
);


-- =============================================================
--  5. CHATBOT & MESSAGING
-- =============================================================

-- Chatbot configuration
/*CREATE TABLE chatbot (
    id              SERIAL          PRIMARY KEY,
    nom             VARCHAR(255)    NOT NULL,
    modele          VARCHAR(255),
    langue          VARCHAR(50)     DEFAULT 'fr',
    actif           BOOLEAN         NOT NULL DEFAULT TRUE
);*/

-- Conversation session between a user and the chatbot
CREATE TABLE conversation_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_debut      TIMESTAMP       NOT NULL DEFAULT NOW(),
    date_fin        TIMESTAMP,
    status          VARCHAR(50)     NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'terminee', 'abandonnee')),
    user_id         UUID
                        REFERENCES users(id) ON DELETE SET NULL,
    /*chatbot_id      INTEGER
                        REFERENCES chatbot(id) ON DELETE SET NULL*/
);

-- Individual messages within a session
CREATE TABLE message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contenu         TEXT            NOT NULL,
    date            TIMESTAMP       NOT NULL DEFAULT NOW(),
    sender          VARCHAR(20)     NOT NULL DEFAULT 'user'
                        CHECK (sender IN ('user', 'bot')),
    session_id      UUID         NOT NULL
                        REFERENCES conversation_session(id) ON DELETE CASCADE
);


-- =============================================================
--  6. PRESTATAIRE JOBS
-- =============================================================

-- Job postings managed by a prestataire
CREATE TABLE job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255)    NOT NULL,
    description     TEXT,
    date            DATE,
    prestataire_id  UUID         NOT NULL
                        REFERENCES prestataire(user_id) ON DELETE CASCADE
);

-- Job offers from a citizen
CREATE TABLE job_offer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          VARCHAR(50)     NOT NULL DEFAULT 'en_attente'
                        CHECK (status IN ('en_attente', 'en_cours', 'approuvee', 'rejetee', 'terminee')),
    date_job_suggestion TIMESTAMP NOT NULL, 
    date_creation   TIMESTAMP       NOT NULL DEFAULT NOW(),
    user_id UUID         NOT NULL
                        REFERENCES users(id) ON DELETE CASCADE,
    job_id  UUID         NOT NULL
                        REFERENCES job(id) ON DELETE CASCADE
);

-- =============================================================
--  8. faq
-- =============================================================

CREATE TABLE faqs (
  id SERIAL PRIMARY KEY,
  question VARCHAR(255) NOT NULL,
  answer VARCHAR(255),
);

-- =============================================================
--  7. INDEXES  (performance on the most common FK lookups)
-- =============================================================

CREATE INDEX idx_auth_session_user         ON auth_session(user_id);
CREATE INDEX idx_auth_session_token        ON auth_session(token);
CREATE INDEX idx_notification_user         ON notification(user_id);
CREATE INDEX idx_horaire_municipalite      ON horaire_service(municipalite_id);
CREATE INDEX idx_news_municipalite  ON news(municipalite_id);
CREATE INDEX idx_news_article_news  ON news_article(news_id);
CREATE INDEX idx_service_municipalite      ON service(municipalite_id);
CREATE INDEX idx_plainte_user              ON plainte(user_id);
CREATE INDEX idx_plainte_categorie         ON plainte(categorie_id);
CREATE INDEX idx_plainte_status            ON plainte(status);
CREATE INDEX idx_sig_media_plainte         ON plainte_media(plainte_id);
CREATE INDEX idx_sig_reponse_plainte       ON plainte_reponse(plainte_id);
CREATE INDEX idx_demande_user              ON demande_service(user_id);
CREATE INDEX idx_demande_service           ON demande_service(service_id);
CREATE INDEX idx_demande_status            ON demande_service(status);
CREATE INDEX idx_certificat_demande        ON certificat_service(demande_id);
CREATE INDEX idx_fichier_demande           ON demande_service_document(demande_id);
CREATE INDEX idx_conv_session_user         ON conversation_session(user_id);
CREATE INDEX idx_message_session           ON message(session_id);
CREATE INDEX idx_job_prestataire           ON job(prestataire_id);
CREATE INDEX idx_job_offer_job             ON job_offer(job_id);
CREATE INDEX idx_job_offer_user            ON job_offer(user_id);
CREATE INDEX idx_faqs_question             ON faqs (question);

-- =============================================================
--  END OF SCRIPT
-- =============================================================