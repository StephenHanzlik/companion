-- Fixed-UUID demo user so the frontend can hardcode owner/created_by fields
-- until real auth exists.
INSERT INTO users (id, email, display_name)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo@observer.local', 'Demo User')
ON CONFLICT (id) DO NOTHING;
