-- Remove allergies columns from profiles table
ALTER TABLE profiles
DROP COLUMN IF EXISTS allergies,
DROP COLUMN IF EXISTS other_allergy;
