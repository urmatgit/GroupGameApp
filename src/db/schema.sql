-- PostgreSQL Schema for Group Game App
-- Version 2.0 (Target: PostgreSQL 15+ / 16+)
-- Architecture: Domain-driven with strict relational integrity, UUID keys and UTC timestamps

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('User', 'Moderator', 'Administrator');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('Active', 'Suspended', 'Blocked', 'Deleted');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE game_status AS ENUM ('Draft', 'Open', 'Full', 'StartingSoon', 'InProgress', 'Completed', 'Cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE participant_status AS ENUM ('Main', 'Waitlist', 'Cancelled', 'Removed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('Attended', 'NoShow', 'Excused');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE recurrence_type AS ENUM ('Weekly', 'BiWeekly', 'Monthly');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE complaint_status AS ENUM ('Pending', 'Investigating', 'Resolved', 'Dismissed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- 1. Cities
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(100) NOT NULL DEFAULT 'Россия',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(30),
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    status user_status NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Roles & UserRoles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name user_role NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- 4. UserSessions (JWT refresh tokens)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_info TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Sports & SportLevels
CREATE TABLE IF NOT EXISTS sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sport_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 1,
    CONSTRAINT uq_sport_level UNIQUE (sport_id, name)
);

-- 6. UserSports (User proficiency per sport)
CREATE TABLE IF NOT EXISTS user_sports (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES sport_levels(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, sport_id)
);

-- 7. Venues
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    metro VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    facilities TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Subscription Plans & Entitlements
CREATE TABLE IF NOT EXISTS entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    price_kopecks INT NOT NULL DEFAULT 0,
    period VARCHAR(20) NOT NULL DEFAULT 'month',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan_entitlements (
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    entitlement_id UUID NOT NULL REFERENCES entitlements(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, entitlement_id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE
);

-- 9. GameTemplates (Recurring Games)
CREATE TABLE IF NOT EXISTS game_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
    level_id UUID NOT NULL REFERENCES sport_levels(id) ON DELETE RESTRICT,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INT NOT NULL CHECK (duration_minutes >= 30),
    recurrence_type recurrence_type NOT NULL DEFAULT 'Weekly',
    days_of_week INT[] NOT NULL, -- 1=Mon .. 7=Sun
    start_date DATE NOT NULL,
    end_date DATE,
    max_players INT NOT NULL CHECK (max_players > 0),
    price_kopecks INT NOT NULL DEFAULT 0 CHECK (price_kopecks >= 0),
    description TEXT,
    rules TEXT,
    cancellation_deadline_hours INT NOT NULL DEFAULT 3,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Games
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES game_templates(id) ON DELETE SET NULL,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
    level_id UUID NOT NULL REFERENCES sport_levels(id) ON DELETE RESTRICT,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    start_date_time TIMESTAMPTZ NOT NULL,
    end_date_time TIMESTAMPTZ NOT NULL,
    time_zone VARCHAR(50) NOT NULL DEFAULT 'Europe/Moscow',
    max_players INT NOT NULL CHECK (max_players > 0),
    price_kopecks INT NOT NULL DEFAULT 0 CHECK (price_kopecks >= 0),
    description TEXT,
    rules TEXT,
    cancellation_deadline_hours INT NOT NULL DEFAULT 3,
    status game_status NOT NULL DEFAULT 'Open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_game_times CHECK (end_date_time > start_date_time)
);

-- 11. GameParticipants (Main and Waitlist with FIFO queue position)
CREATE TABLE IF NOT EXISTS game_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status participant_status NOT NULL DEFAULT 'Main',
    queue_position INT CHECK (queue_position IS NULL OR queue_position > 0),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    CONSTRAINT uq_game_user UNIQUE (game_id, user_id)
);

-- 12. GameAttendance
CREATE TABLE IF NOT EXISTS game_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    marked_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status attendance_status NOT NULL DEFAULT 'Attended',
    marked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_attendance UNIQUE (game_id, user_id)
);

-- 13. GameHistory
CREATE TABLE IF NOT EXISTS game_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. Ratings & Reviews
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stars INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_game_rating_pair UNIQUE (game_id, from_user_id, to_user_id),
    CONSTRAINT chk_no_self_rating CHECK (from_user_id <> to_user_id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rating_id UUID NOT NULL UNIQUE REFERENCES ratings(id) ON DELETE CASCADE,
    review_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15. Blacklist Entries (Personal Organizer Blacklist)
CREATE TABLE IF NOT EXISTS blacklist_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_blacklist_entry UNIQUE (owner_user_id, blocked_user_id),
    CONSTRAINT chk_no_self_block CHECK (owner_user_id <> blocked_user_id)
);

-- 16. Complaints & Moderation
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    game_id UUID REFERENCES games(id) ON DELETE SET NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status complaint_status NOT NULL DEFAULT 'Pending',
    resolved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

-- 17. In-App Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    game_id UUID REFERENCES games(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 18. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(150),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR FAST QUERYING
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_games_city_sport_date ON games (venue_id, sport_id, start_date_time, status);
CREATE INDEX IF NOT EXISTS idx_game_participants_game_status ON game_participants (game_id, status);
CREATE INDEX IF NOT EXISTS idx_game_participants_user ON game_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints (status, created_at DESC);
