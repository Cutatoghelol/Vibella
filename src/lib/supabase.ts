import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  goals: string | null;
  health_goals: string[];
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  mood_emoji: string | null;
  topics: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: Profile;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
};

export type Habit = {
  id: string;
  user_id: string;
  date: string;
  sleep_hours: number;
  water_glasses: number;
  steps: number;
  meditation_minutes: number;
  created_at: string;
};

export type Challenge = {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  start_date: string;
  end_date: string;
  goal_value: number;
  participants_count: number;
  created_at: string;
};

export type Achievement = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  requirement_type: string;
  requirement_value: number;
  created_at: string;
};

export type ExpertContent = {
  id: string;
  author_id: string | null;
  title: string;
  content: string | null;
  content_type: string;
  video_url: string | null;
  thumbnail_url: string | null;
  views_count: number;
  created_at: string;
  profiles?: Profile;
};
