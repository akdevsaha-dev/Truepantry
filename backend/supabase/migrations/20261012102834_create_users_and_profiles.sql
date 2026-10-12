CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    age INT CHECK (age > 0 AND age < 120),
    current_weight_kg NUMERIC(5, 2) NOT NULL,
    target_weight_kg NUMERIC(5, 2) NOT NULL,
    fitness_goal VARCHAR(30) NOT NULL CHECK (fitness_goal IN ('lean', 'healthy', 'muscle_gain', 'maintenance')),
    eco_conscious BOOLEAN DEFAULT FALSE NOT NULL,
    dietary_restrictions TEXT[] DEFAULT '{}', -- e.g. ['vegan', 'gluten-free', 'nut-allergy']
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
