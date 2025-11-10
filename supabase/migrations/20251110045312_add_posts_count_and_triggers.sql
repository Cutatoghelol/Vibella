/*
  # Add posts_count column and auto-update triggers

  1. Schema Changes
    - Add `posts_count` column to profiles table to track number of posts per user
  
  2. Functions
    - Create function to update user posts count automatically
  
  3. Triggers
    - Trigger on posts INSERT to increment posts_count
    - Trigger on posts DELETE to decrement posts_count
  
  4. Data Migration
    - Initialize posts_count for existing users based on current post counts
  
  5. Benefits
    - Automatic real-time count updates for user posts
    - Consistent data integrity
    - Better performance (no need to count on every query)
*/

-- Add posts_count column to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'posts_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN posts_count INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Initialize posts_count for existing users
UPDATE profiles
SET posts_count = (
  SELECT COUNT(*) 
  FROM posts 
  WHERE posts.user_id = profiles.id
);

-- Function to update user posts count
CREATE OR REPLACE FUNCTION update_user_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles
    SET posts_count = posts_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET posts_count = GREATEST(0, posts_count - 1)
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_posts_count_on_insert ON posts;
DROP TRIGGER IF EXISTS trigger_update_posts_count_on_delete ON posts;

-- Create trigger for posts INSERT
CREATE TRIGGER trigger_update_posts_count_on_insert
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_posts_count();

-- Create trigger for posts DELETE
CREATE TRIGGER trigger_update_posts_count_on_delete
  AFTER DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_posts_count();
