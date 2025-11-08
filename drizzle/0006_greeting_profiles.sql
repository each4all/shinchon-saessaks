CREATE TABLE IF NOT EXISTS greeting_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    label text NOT NULL,
    title text NOT NULL,
    credential_heading text,
    image_url text,
    people jsonb NOT NULL DEFAULT '[]'::jsonb,
    highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
    credentials jsonb NOT NULL DEFAULT '[]'::jsonb,
    body text,
    closing text,
    order_index integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_greeting_profiles_slug ON greeting_profiles (slug);
