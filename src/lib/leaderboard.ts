import { supabase } from './supabase';

const getWeekStart = (): string => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  return weekStart.toISOString().split('T')[0];
};

export const updateLeaderboardScore = async (userId: string) => {
  if (!userId) return;

  const weekStart = getWeekStart();

  // Get current week's posts count
  const { count: postsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', weekStart);

  // Get current week's likes given by user
  const { count: likesGiven } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', weekStart);

  // Get current week's comments given by user
  const { count: commentsGiven } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', weekStart);

  // Calculate score: posts (10 points) + likes (2 points) + comments (5 points)
  const score = (postsCount || 0) * 10 + (likesGiven || 0) * 2 + (commentsGiven || 0) * 5;

  // Upsert leaderboard score
  await supabase.from('leaderboard_scores').upsert(
    {
      user_id: userId,
      week_start: weekStart,
      score: score,
      posts_count: postsCount || 0,
      likes_given: likesGiven || 0,
      comments_given: commentsGiven || 0,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,week_start',
    }
  );
};
