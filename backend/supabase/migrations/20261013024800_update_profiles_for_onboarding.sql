-- Add is_onboarded to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE NOT NULL;

-- Relax old constraints on profiles to support flexible onboarding steps
ALTER TABLE profiles 
ALTER COLUMN current_weight_kg DROP NOT NULL,
ALTER COLUMN target_weight_kg DROP NOT NULL,
ALTER COLUMN fitness_goal DROP NOT NULL;

ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_gender_check,
DROP CONSTRAINT IF EXISTS profiles_fitness_goal_check;

ALTER TABLE profiles 
ALTER COLUMN gender TYPE VARCHAR(50);

-- Add onboarding fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS height NUMERIC(5, 1),
ADD COLUMN IF NOT EXISTS goal VARCHAR(50),
ADD COLUMN IF NOT EXISTS diet VARCHAR(50),
ADD COLUMN IF NOT EXISTS other_diet VARCHAR(120),
ADD COLUMN IF NOT EXISTS allergies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS other_allergy VARCHAR(200),
ADD COLUMN IF NOT EXISTS onboarding_step INT DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE NOT NULL;
