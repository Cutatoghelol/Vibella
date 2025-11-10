/*
  # Fix Trigger Functions to Run with SECURITY DEFINER

  1. Problem
    - Trigger functions run with the privileges of the invoking user by default
    - When a user inserts a comment, the trigger tries to insert into achievements table
    - Even though RLS policy allows INSERT, trigger functions need elevated privileges
  
  2. Solution
    - Add SECURITY DEFINER to all trigger functions
    - This makes them run with the privileges of the function creator (postgres superuser)
    - Allows triggers to insert into achievements table regardless of RLS
  
  3. Security
    - Safe because the functions only perform predetermined operations
    - No user input is directly used in queries (parameterized with NEW/OLD records)
    - Functions only award achievements based on verified counts
*/

-- Recreate all trigger functions with SECURITY DEFINER

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for posts
CREATE OR REPLACE FUNCTION trigger_check_post_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_achievement(NEW.user_id, 'post');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for likes
CREATE OR REPLACE FUNCTION trigger_check_like_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_achievement(NEW.user_id, 'like');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for comments
CREATE OR REPLACE FUNCTION trigger_check_comment_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_achievement(NEW.user_id, 'comment');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for habits
CREATE OR REPLACE FUNCTION trigger_check_habit_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_achievement(NEW.user_id, 'habit');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for challenge join
CREATE OR REPLACE FUNCTION trigger_check_challenge_join_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_achievement(NEW.user_id, 'challenge_join');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for challenge completion
CREATE OR REPLACE FUNCTION trigger_check_challenge_complete_achievements()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    PERFORM check_and_award_achievement(NEW.user_id, 'challenge_complete');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
