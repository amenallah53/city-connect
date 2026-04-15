-- =============================================================
--  DATABASE CREATION SCRIPT — PostgreSQL (Aiven compatible)
--  Project: Municipal Citizen Services Platform
--  Media storage: Backblaze B2 (all file fields stored as URLs)
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================
--  1. CORE USER & AUTH
-- =============================================================

/*CREATE TABLE users (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    cin                 INTEGER         UNIQUE NOT NULL,
    first_name          VARCHAR(255)    NOT NULL,
    last_name           VARCHAR(255)    NOT NULL,
    email               VARCHAR(255)    UNIQUE NOT NULL,
    addresse            VARCHAR(255),
    telephone           VARCHAR(50),
    password            VARCHAR(255)    NOT NULL,             -- hashed
    status              VARCHAR(50)     NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'accepted', 'rejected')),
    role                VARCHAR(50)     NOT NULL DEFAULT 'citoyen'
                            CHECK (role IN ('citoyen', 'prestataire', 'admin')),
    extra_document_url  TEXT,                                 -- Backblaze B2 URL
    document_type       VARCHAR(100),
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);*/

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cin             VARCHAR(255)         UNIQUE,
    first_name      VARCHAR(255)    NOT NULL,
    last_name       VARCHAR(255)    NOT NULL,
    email           VARCHAR(255)    UNIQUE NOT NULL,
    password        VARCHAR(255)    NOT NULL,
    adresse         VARCHAR(255),
    document        VARCHAR(255),
    document_type       VARCHAR(100),
    telephone       VARCHAR(50),
    status              VARCHAR(50)     NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'accepted', 'rejected')),
    date_naissance  DATE,
    role VARCHAR(50) NOT NULL DEFAULT 'citoyen' CHECK (role IN ('citoyen', 'prestataire', 'admin')),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE prestataire (
    user_id             UUID            PRIMARY KEY
                            REFERENCES users(id) ON DELETE CASCADE,
    status              VARCHAR(50)     NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'accepted', 'rejected')),
    reach               VARCHAR(50)     NOT NULL DEFAULT 'new'
                            CHECK (reach IN ('new', 'recommended', 'on-demand')),  
    rating DECIMAL(2,1) DEFAULT 4.5,
    description         TEXT,
    social_links        TEXT[],                                                     
    specialty           VARCHAR(255),
    extra_document_url  TEXT,                                 -- Backblaze B2 URL
    document_type       VARCHAR(100),
    submission_date     TIMESTAMP       NOT NULL DEFAULT NOW()
);

/*CREATE TABLE auth_session (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    token               TEXT            NOT NULL,
    expiration_date     TIMESTAMP       NOT NULL,
    user_id             UUID            NOT NULL
                            REFERENCES users(id) ON DELETE CASCADE,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);*/

CREATE TABLE notification (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    message             TEXT            NOT NULL,
    date                TIMESTAMP       NOT NULL DEFAULT NOW(),
    is_read             BOOLEAN         NOT NULL DEFAULT FALSE,
    user_id             UUID            NOT NULL
                            REFERENCES users(id) ON DELETE CASCADE
);


-- =============================================================
--  2. MUNICIPALITY & RELATED ENTITIES
-- =============================================================

CREATE TABLE municipalite (
    id                  SERIAL          PRIMARY KEY,
    name                VARCHAR(255)    NOT NULL
);

CREATE TABLE horaire_service (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    type                VARCHAR(100),
    name                VARCHAR(255),
    heure_deb           TIME            NOT NULL DEFAULT '07:00',
    heure_fin           TIME,
    days                TEXT[],
    municipalite_id     INTEGER
                            REFERENCES municipalite(id) ON DELETE SET NULL
);

-- slug kept as UNIQUE column (not PK) — UUID is the stable PK,
-- slug is for SEO/URLs and can theoretically be updated
CREATE TABLE news (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                VARCHAR(255)    UNIQUE NOT NULL,
    author              VARCHAR(255)    DEFAULT 'City Council',
    date                TIMESTAMP       NOT NULL DEFAULT NOW(),
    badges              TEXT[]          NOT NULL DEFAULT '{}',
    hero_img            TEXT,                                 -- Backblaze B2 URL
    hero_title          VARCHAR(255),
    hero_subtitle       VARCHAR(255),
    municipalite_id     INTEGER
                            REFERENCES municipalite(id) ON DELETE SET NULL
);

CREATE TABLE news_article (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id             UUID            NOT NULL
                            REFERENCES news(id) ON DELETE CASCADE,
    position            SMALLINT        NOT NULL DEFAULT 0,
    title               VARCHAR(255)    NOT NULL,
    content             TEXT            NOT NULL,
    media_url           TEXT,                                 -- Backblaze B2 URL (optional)
    media_type          VARCHAR(100)
);


-- =============================================================
--  3. PLAINTE (Citizen complaints)
-- =============================================================

CREATE TABLE plainte_categorie (
    id                  SERIAL          PRIMARY KEY,
    type                VARCHAR(100)    NOT NULL
);

CREATE TABLE plainte (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(255),
    description         TEXT,
    status              VARCHAR(50)     NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'in-process', 'accepted', 'rejected')),
    date_creation       TIMESTAMP       NOT NULL DEFAULT NOW(),
    location            VARCHAR(255),
    user_id             UUID
                            REFERENCES users(id) ON DELETE SET NULL,
    categorie_id        INTEGER
                            REFERENCES plainte_categorie(id) ON DELETE SET NULL
);

CREATE TABLE plainte_media (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    file_url            TEXT            NOT NULL,             -- Backblaze B2 URL
    file_type           VARCHAR(100),
    plainte_id          UUID            NOT NULL
                            REFERENCES plainte(id) ON DELETE CASCADE
);

CREATE TABLE plainte_reponse (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    expeditaire         VARCHAR(255),
    recepteur           VARCHAR(255),
    contenu             TEXT,
    date_reponse        TIMESTAMP       NOT NULL DEFAULT NOW(),
    plainte_id          UUID            NOT NULL
                            REFERENCES plainte(id) ON DELETE CASCADE
);


-- =============================================================
--  4. SERVICE & SERVICE REQUESTS
-- =============================================================

CREATE TABLE service_type (
    id                  SERIAL          PRIMARY KEY,
    type                VARCHAR(100)    NOT NULL
);

CREATE TABLE service (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    type                VARCHAR(100),
    name                VARCHAR(255),
    badges              TEXT[]          NOT NULL DEFAULT '{}',
    description         TEXT,
    requirements        TEXT[], -- list of requirements
    municipalite_id     INTEGER
                            REFERENCES municipalite(id) ON DELETE SET NULL
);

CREATE TABLE demande_service (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    status              VARCHAR(50)     NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'rejected')),
    submission_date     TIMESTAMP       NOT NULL DEFAULT NOW(),
    description         TEXT,
    cin                 VARCHAR(255),
    first_name          VARCHAR(255),
    last_name           VARCHAR(255),
    email               VARCHAR(255),
    addresse            VARCHAR(255),
    telephone           VARCHAR(50),
    admin_notes         TEXT,
    user_id             UUID
                            REFERENCES users(id) ON DELETE SET NULL,
    service_id          UUID
                            REFERENCES service(id) ON DELETE SET NULL
);

CREATE TABLE certificat_service (
    id                  SERIAL          PRIMARY KEY,
    type                VARCHAR(100),
    date_generation     TIMESTAMP       NOT NULL DEFAULT NOW(),
    file_url            TEXT,                                 -- Backblaze B2 URL
    demande_id          UUID            UNIQUE NOT NULL
                            REFERENCES demande_service(id) ON DELETE CASCADE
);

CREATE TABLE demande_service_document (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    file_url            TEXT            NOT NULL,             -- Backblaze B2 URL
    file_type           VARCHAR(100),
    demande_id          UUID
                            REFERENCES demande_service(id) ON DELETE CASCADE
);


-- =============================================================
--  5. CHATBOT & MESSAGING
-- =============================================================

CREATE TABLE conversation_session (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    session_date        TIMESTAMP       NOT NULL DEFAULT NOW(),
    session_name        VARCHAR(50)     DEFAULT 'SESSION NOT NAMED YET',       
    user_id             UUID
                            REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE message (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    contenu             TEXT            NOT NULL,
    date                TIMESTAMP       NOT NULL DEFAULT NOW(),
    sender              VARCHAR(20)     NOT NULL DEFAULT 'user'
                            CHECK (sender IN ('user', 'bot')),
    session_id          UUID            NOT NULL
                            REFERENCES conversation_session(id) ON DELETE CASCADE
);


-- =============================================================
--  6. PRESTATAIRE JOB OFFERS
-- =============================================================

CREATE TABLE job_offer (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    status              VARCHAR(50)     NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'rejected', 'done', 'cancelled')),
    date_job_suggestion TIMESTAMP       NOT NULL,
    date_creation       TIMESTAMP       NOT NULL DEFAULT NOW(),
    prestataire_id      UUID            NOT NULL
                            REFERENCES prestataire(user_id) ON DELETE CASCADE,
    offeror_id      UUID            NOT NULL
                            REFERENCES users(id) ON DELETE CASCADE
);


-- =============================================================
--  7. FAQ
-- =============================================================

CREATE TABLE faqs (
    id                  SERIAL          PRIMARY KEY,
    question            VARCHAR(255)    NOT NULL,
    answer              TEXT                                 
);


-- =============================================================
--  8. INDEXES
-- =============================================================

CREATE INDEX idx_auth_session_user         ON auth_session(user_id);
CREATE INDEX idx_auth_session_token        ON auth_session(token);
CREATE INDEX idx_notification_user         ON notification(user_id);
CREATE INDEX idx_horaire_municipalite      ON horaire_service(municipalite_id);
CREATE INDEX idx_news_municipalite         ON news(municipalite_id);
CREATE INDEX idx_news_article_news         ON news_article(news_id);
CREATE INDEX idx_service_municipalite      ON service(municipalite_id);
CREATE INDEX idx_plainte_user              ON plainte(user_id);
CREATE INDEX idx_plainte_categorie         ON plainte(categorie_id);
CREATE INDEX idx_plainte_status            ON plainte(status);
CREATE INDEX idx_plainte_media             ON plainte_media(plainte_id);
CREATE INDEX idx_plainte_reponse           ON plainte_reponse(plainte_id);
CREATE INDEX idx_demande_user              ON demande_service(user_id);
CREATE INDEX idx_demande_service           ON demande_service(service_id);
CREATE INDEX idx_demande_status            ON demande_service(status);
CREATE INDEX idx_certificat_demande        ON certificat_service(demande_id);
CREATE INDEX idx_demande_document          ON demande_service_document(demande_id);
CREATE INDEX idx_conv_session_user         ON conversation_session(user_id);
CREATE INDEX idx_message_session           ON message(session_id);
CREATE INDEX idx_job_offer_prestataire     ON job_offer(prestataire_id);
CREATE INDEX idx_job_offer_offeror         ON job_offer(offeror_id);
CREATE INDEX idx_faqs_question             ON faqs(question);


-- =============================================================
--  END OF SCRIPT
-- =============================================================