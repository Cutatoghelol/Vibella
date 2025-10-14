/*
  # Vibella Social Platform Schema

  ## Overview
  Complete database schema for Vibella mental wellness social platform with user profiles,
  posts, interactions, habits, challenges, achievements, and expert content.

  ## New Tables

  ### 1. profiles
  Extended user profile information
  - `id` (uuid, primary key, references auth.users)
  - `username` (text, unique)
  - `full_name` (text)
  - `avatar_url` (text)
  - `bio` (text)
  - `goals` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. posts
  User posts with text, images, and mood
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `content` (text)
  - `image_url` (text, nullable)
  - `mood_emoji` (text, nullable)
  - `topics` (text array for hashtags)
  - `likes_count` (integer)
  - `comments_count` (integer)
  - `created_at` (timestamptz)

  ### 3. post_likes
  Track post likes
  - `id` (uuid, primary key)
  - `post_id` (uuid, references posts)
  - `user_id` (uuid, references profiles)
  - `created_at` (timestamptz)
  - Unique constraint on (post_id, user_id)

  ### 4. comments
  Post comments
  - `id` (uuid, primary key)
  - `post_id` (uuid, references posts)
  - `user_id` (uuid, references profiles)
  - `content` (text)
  - `created_at` (timestamptz)

  ### 5. habits
  Daily habit tracking
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `date` (date)
  - `sleep_hours` (integer, nullable)
  - `water_glasses` (integer, nullable)
  - `steps` (integer, nullable)
  - `meditation_minutes` (integer, nullable)
  - `created_at` (timestamptz)
  - Unique constraint on (user_id, date)

  ### 6. challenges
  Community challenges
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `start_date` (date)
  - `end_date` (date)
  - `goal_type` (text: 'steps', 'meditation', 'water', 'sleep')
  - `goal_value` (integer)
  - `participants_count` (integer)
  - `created_at` (timestamptz)

  ### 7. challenge_participants
  Users participating in challenges
  - `id` (uuid, primary key)
  - `challenge_id` (uuid, references challenges)
  - `user_id` (uuid, references profiles)
  - `progress` (integer)
  - `completed` (boolean)
  - `joined_at` (timestamptz)
  - Unique constraint on (challenge_id, user_id)

  ### 8. achievements
  User achievement badges
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `badge_type` (text)
  - `badge_name` (text)
  - `badge_description` (text)
  - `earned_at` (timestamptz)

  ### 9. leaderboard_scores
  Weekly positive energy scores
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `week_start` (date)
  - `score` (integer)
  - `posts_count` (integer)
  - `likes_given` (integer)
  - `comments_given` (integer)
  - `updated_at` (timestamptz)
  - Unique constraint on (user_id, week_start)

  ### 10. expert_content
  Expert blogs and videos
  - `id` (uuid, primary key)
  - `title` (text)
  - `author` (text)
  - `content` (text)
  - `content_type` (text: 'blog', 'video')
  - `video_url` (text, nullable)
  - `thumbnail_url` (text, nullable)
  - `topics` (text array)
  - `views_count` (integer)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Authenticated users can read all public content
  - Users can only modify their own data
  - Proper ownership checks on all operations
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  goals text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  mood_emoji text,
  topics text[] DEFAULT '{}',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON post_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  sleep_hours integer,
  water_glasses integer,
  steps integer,
  meditation_minutes integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  goal_type text NOT NULL,
  goal_value integer NOT NULL,
  participants_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (true);

-- Create challenge_participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  progress integer DEFAULT 0,
  completed boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view participants"
  ON challenge_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join challenges"
  ON challenge_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON challenge_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  badge_description text NOT NULL,
  earned_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create leaderboard_scores table
CREATE TABLE IF NOT EXISTS leaderboard_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  score integer DEFAULT 0,
  posts_count integer DEFAULT 0,
  likes_given integer DEFAULT 0,
  comments_given integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE leaderboard_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own score"
  ON leaderboard_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard"
  ON leaderboard_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create expert_content table
CREATE TABLE IF NOT EXISTS expert_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  content text NOT NULL,
  content_type text NOT NULL,
  video_url text,
  thumbnail_url text,
  topics text[] DEFAULT '{}',
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expert_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view expert content"
  ON expert_content FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_topics ON posts USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_date ON habits(user_id, date);
CREATE INDEX IF NOT EXISTS idx_leaderboard_week ON leaderboard_scores(week_start, score DESC);
CREATE INDEX IF NOT EXISTS idx_expert_content_topics ON expert_content USING GIN(topics);