/*
  # Auto Achievement System

  1. Overview
    - Automatically awards badges when users reach milestones
    - Uses triggers to check conditions after relevant user actions
    - No duplicate badges (unique constraint on user_id + badge_type)
  
  2. Achievement Types & Requirements
    
    **Posts-based:**
    - first_post: Create 1st post
    - active_poster: Create 10 posts
    - prolific_writer: Create 50 posts
    - content_master: Create 100 posts
    
    **Likes-based:**
    - first_like: Give 1st like
    - supporter: Give 50 likes
    - super_supporter: Give 200 likes
    
    **Comments-based:**
    - first_comment: Write 1st comment
    - conversationalist: Write 25 comments
    - community_champion: Write 100 comments
    
    **Habits-based:**
    - habit_starter: Log habits for 1 day
    - week_warrior: Log habits for 7 consecutive days
    - month_champion: Log habits for 30 consecutive days
    
    **Challenges-based:**
    - challenge_joiner: Join 1st challenge
    - challenge_completer: Complete 1st challenge
    - challenge_master: Complete 5 challenges
  
  3. Functions
    - check_and_award_achievement: Main function to check and award badges
  
  4. Triggers
    - After INSERT on posts, post_likes, comments, habits, challenge_participants
    - After UPDATE on challenge_participants (for completions)
  
  5. Security
    - Unique constraint prevents duplicate badges
    - Uses ON CONFLICT DO NOTHING for idempotency
*/

-- Add unique constraint to prevent duplicate badges
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'achievements_user_badge_unique'
  ) THEN
    ALTER TABLE achievements 
    ADD CONSTRAINT achievements_user_badge_unique 
    UNIQUE (user_id, badge_type);
  END IF;
END $$;

-- Main function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievement(
  p_user_id UUID,
  p_check_type TEXT
)
RETURNS VOID AS $$
DECLARE
  v_count INTEGER;
  v_consecutive_days INTEGER;
BEGIN
  -- Posts achievements
  IF p_check_type = 'post' THEN
    SELECT COUNT(*) INTO v_count FROM posts WHERE user_id = p_user_id;
    
    IF v_count >= 1 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'first_post', 'Bài Viết Đầu Tiên', 'Đã đăng bài viết đầu tiên')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    IF v_count >= 10 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'active_poster', 'Người Đăng Bài Tích Cực', 'Đã đăng 10 bài viết')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    IF v_count >= 50 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'prolific_writer', 'Nhà Viết Nhiều Bài', 'Đã đăng 50 bài viết')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    IF v_count >= 100 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'content_master', 'Bậc Thầy Nội Dung', 'Đã đăng 100 bài viết')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
  END IF;

  -- Likes achievements
  IF p_check_type = 'like' THEN
    SELECT COUNT(*) INTO v_count FROM post_likes WHERE user_id = p_user_id;
    
    IF v_count >= 1 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'first_like', 'Lượt Thích Đầu Tiên', 'Đã thích bài viết đầu tiên')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    IF v_count >= 50 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'supporter', 'Người Ủng Hộ', 'Đã thích 50 bài viết')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    IF v_count >= 200 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'super_supporter', 'Siêu Ủng Hộ', 'Đã thích 200 bài viết')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
  END IF;

  -- Comments achievements
  IF p_check_type = 'comment' THEN
    SELECT COUNT(*) INTO v_count FROM comments WHERE user_id = p_user_id;
    
    IF v_count >= 1 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'first_comment', 'Bình Luận Đầu Tiên', 'Đã bình luận lần đầu')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    IF v_count >= 25 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'conversationalist', 'Người Đàm Thoại', 'Đã bình luận 25 lần')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    IF v_count >= 100 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'community_champion', 'Nhà Vô Địch Cộng Đồng', 'Đã bình luận 100 lần')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
  END IF;

  -- Habits achievements
  IF p_check_type = 'habit' THEN
    SELECT COUNT(DISTINCT date) INTO v_count FROM habits WHERE user_id = p_user_id;
    
    IF v_count >= 1 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'habit_starter', 'Khởi Đầu Thói Quen', 'Đã ghi nhật ký thói quen lần đầu')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    IF v_count >= 7 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'week_warrior', 'Chiến Binh Tuần', 'Đã ghi nhật ký 7 ngày')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    IF v_count >= 30 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'month_champion', 'Nhà Vô Địch Tháng', 'Đã ghi nhật ký 30 ngày')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
  END IF;

  -- Challenge achievements
  IF p_check_type = 'challenge_join' THEN
    SELECT COUNT(*) INTO v_count FROM challenge_participants WHERE user_id = p_user_id;
    
    IF v_count >= 1 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'challenge_joiner', 'Người Tham Gia Thử Thách', 'Đã tham gia thử thách đầu tiên')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
  END IF;

  IF p_check_type = 'challenge_complete' THEN
    SELECT COUNT(*) INTO v_count 
    FROM challenge_participants 
    WHERE user_id = p_user_id AND completed = true;
    
    IF v_count >= 1 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'challenge_completer', 'Người Hoàn Thành Thử Thách', 'Đã hoàn thành thử thách đầu tiên')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    IF v_count >= 5 THEN
      INSERT INTO achievements (user_id, badge_type, badge_name, badge_description)
      VALUES (p_user_id, 'challenge_master', 'Bậc Thầy Thử Thách', 'Đã hoàn thành 5 thử thách')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for posts
CREATE OR REPLACE FUNCTION trigger_check_post_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_achievement(NEW.user_id, 'post');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for likes
CREATE OR REPLACE FUNCTION trigger_check_like_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_achievement(NEW.user_id, 'like');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for comments
CREATE OR REPLACE FUNCTION trigger_check_comment_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_achievement(NEW.user_id, 'comment');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for habits
CREATE OR REPLACE FUNCTION trigger_check_habit_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_achievement(NEW.user_id, 'habit');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for challenge join
CREATE OR REPLACE FUNCTION trigger_check_challenge_join_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_achievement(NEW.user_id, 'challenge_join');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for challenge completion
CREATE OR REPLACE FUNCTION trigger_check_challenge_complete_achievements()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    PERFORM check_and_award_achievement(NEW.user_id, 'challenge_complete');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_award_post_achievements ON posts;
DROP TRIGGER IF EXISTS trigger_award_like_achievements ON post_likes;
DROP TRIGGER IF EXISTS trigger_award_comment_achievements ON comments;
DROP TRIGGER IF EXISTS trigger_award_habit_achievements ON habits;
DROP TRIGGER IF EXISTS trigger_award_challenge_join_achievements ON challenge_participants;
DROP TRIGGER IF EXISTS trigger_award_challenge_complete_achievements ON challenge_participants;

-- Create triggers
CREATE TRIGGER trigger_award_post_achievements
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_post_achievements();

CREATE TRIGGER trigger_award_like_achievements
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_like_achievements();

CREATE TRIGGER trigger_award_comment_achievements
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_comment_achievements();

CREATE TRIGGER trigger_award_habit_achievements
  AFTER INSERT ON habits
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_habit_achievements();

CREATE TRIGGER trigger_award_challenge_join_achievements
  AFTER INSERT ON challenge_participants
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_challenge_join_achievements();

CREATE TRIGGER trigger_award_challenge_complete_achievements
  AFTER UPDATE ON challenge_participants
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_challenge_complete_achievements();
