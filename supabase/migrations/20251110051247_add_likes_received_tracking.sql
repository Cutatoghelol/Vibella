/*
  # Add Likes Received Tracking

  1. Schema Changes
    - Add likes_received column to profiles table
    - Tracks total number of likes a user has received on all their posts
  
  2. Triggers
    - Auto-increment likes_received when someone likes a user's post
    - Auto-decrement likes_received when someone unlikes a user's post
  
  3. Data Migration
    - Calculate and populate existing likes_received for all users
  
  4. Benefits
    - Separates "likes given" (post_likes table) from "likes received" (profiles.likes_received)
    - Real-time updates via triggers
    - Better user stats visibility
*/

-- Add likes_received column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'likes_received'
  ) THEN
    ALTER TABLE profiles ADD COLUMN likes_received INTEGER DEFAULT 0;
  END IF;
END $$;

-- Function to increment likes_received when a post is liked
CREATE OR REPLACE FUNCTION increment_likes_received()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the post owner and increment their likes_received
  UPDATE profiles
  SET likes_received = likes_received + 1
  WHERE id = (SELECT user_id FROM posts WHERE id = NEW.post_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement likes_received when a post is unliked
CREATE OR REPLACE FUNCTION decrement_likes_received()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the post owner and decrement their likes_received
  UPDATE profiles
  SET likes_received = GREATEST(likes_received - 1, 0)
  WHERE id = (SELECT user_id FROM posts WHERE id = OLD.post_id);
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_increment_likes_received ON post_likes;
DROP TRIGGER IF EXISTS trigger_decrement_likes_received ON post_likes;

-- Create trigger for when a post is liked
CREATE TRIGGER trigger_increment_likes_received
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_likes_received();

-- Create trigger for when a post is unliked
CREATE TRIGGER trigger_decrement_likes_received
  AFTER DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_likes_received();

-- Calculate and populate existing likes_received for all users
UPDATE profiles p
SET likes_received = (
  SELECT COUNT(*)
  FROM post_likes pl
  JOIN posts po ON po.id = pl.post_id
  WHERE po.user_id = p.id
);
