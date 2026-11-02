-- These came from the first version of onboarding and are no longer read or written.
-- Onboarding now stores dob, height, gender, goal, diet and other_diet.
ALTER TABLE profiles
DROP COLUMN IF EXISTS age,
DROP COLUMN IF EXISTS current_weight_kg,
DROP COLUMN IF EXISTS target_weight_kg,
DROP COLUMN IF EXISTS fitness_goal,
DROP COLUMN IF EXISTS eco_conscious,
DROP COLUMN IF EXISTS dietary_restrictions;
