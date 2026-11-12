-- Current full schema snapshot, used by sqlc for type generation.
-- Must be kept in sync with db/migrate/*.up.sql (the source of truth applied to real databases).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE trip_status AS ENUM ('planning', 'active', 'debriefed');
CREATE TYPE observation_type AS ENUM ('weather', 'terrain', 'avalanche', 'red_flag', 'general');
CREATE TYPE snow_test_type AS ENUM ('compression_test', 'extended_column_test', 'propagation_saw_test', 'pit_profile', 'other');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    state CHAR(2)
        CHECK (state IN (
            'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
            'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
            'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
            'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
            'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
        )),
    status trip_status NOT NULL DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trip_members (
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role TEXT NOT NULL DEFAULT 'member',
    PRIMARY KEY (trip_id, user_id)
);

CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
    objectives TEXT,
    route TEXT,
    avalanche_forecast JSONB NOT NULL DEFAULT '{}',
    weather_forecast JSONB NOT NULL DEFAULT '{}',
    hazards JSONB NOT NULL DEFAULT '[]',
    checklist JSONB NOT NULL DEFAULT '[]',
    signed_off_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    observation_type observation_type NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    elevation_m DOUBLE PRECISION,
    notes TEXT,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE snow_profile_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    observation_id UUID REFERENCES observations(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    test_type snow_test_type NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    elevation_m DOUBLE PRECISION,
    aspect TEXT,
    slope_angle_deg DOUBLE PRECISION,
    results JSONB NOT NULL DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE debriefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
    summary TEXT,
    decision_reflections JSONB NOT NULL DEFAULT '[]',
    lessons_learned TEXT,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trips_owner ON trips(owner_id);
CREATE INDEX idx_observations_trip ON observations(trip_id);
CREATE INDEX idx_snow_tests_trip ON snow_profile_tests(trip_id);
