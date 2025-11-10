/*
  # Auto-update likes and comments counts

  1. Functions
    - Create function to update post likes count automatically
    - Create function to update post comments count automatically
  
  2. Triggers
    - Trigger on post_likes INSERT to increment likes_count
    - Trigger on post_likes DELETE to decrement likes_count
    - Trigger on comments INSERT to increment comments_count
    - Trigger on comments DELETE to decrement comments_count
  
  3. Benefits
    - Automatic real-time count updates
    - No need for manual count queries in frontend
    - Consistent data integrity
*/

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_likes_count_on_insert ON post_likes;
DROP TRIGGER IF EXISTS trigger_update_likes_count_on_delete ON post_likes;
DROP TRIGGER IF EXISTS trigger_update_comments_count_on_insert ON comments;
DROP TRIGGER IF EXISTS trigger_update_comments_count_on_delete ON comments;

-- Create trigger for likes INSERT
CREATE TRIGGER trigger_update_likes_count_on_insert
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Create trigger for likes DELETE
CREATE TRIGGER trigger_update_likes_count_on_delete
  AFTER DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Create trigger for comments INSERT
CREATE TRIGGER trigger_update_comments_count_on_insert
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Create trigger for comments DELETE
CREATE TRIGGER trigger_update_comments_count_on_delete
  AFTER DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();
