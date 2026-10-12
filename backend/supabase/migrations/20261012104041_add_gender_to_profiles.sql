-- Add gender column with CHECK constraint to profiles
-- Note: A user can only have one profile because user_id is the PRIMARY KEY of the profiles table.
ALTER TABLE profiles
ADD COLUMN gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
