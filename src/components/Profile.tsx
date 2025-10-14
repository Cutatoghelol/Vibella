import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Target, Award, Heart } from 'lucide-react';

export const Profile = () => {
  const { profile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [goals, setGoals] = useState(profile?.goals || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [userStats, setUserStats] = useState({ posts: 0, likes: 0, achievements: 0 });
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setGoals(profile.goals || '');
      setAvatarUrl(profile.avatar_url || '');
    }
    loadUserStats();
    loadAchievements();
  }, [profile]);

  const loadUserStats = async () => {
    if (!user?.id) return;

    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: likesCount } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: achievementsCount } = await supabase
      .from('achievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    setUserStats({
      posts: postsCount || 0,
      likes: likesCount || 0,
      achievements: achievementsCount || 0,
    });
  };

  const loadAchievements = async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    setAchievements(data || []);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        username,
        full_name: fullName,
        bio,
        goals,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return;
    }

    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-rose-200"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            {isEditing && (
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="URL ảnh đại diện"
                className="mt-4 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent w-full"
              />
            )}
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới thiệu
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mục tiêu
                  </label>
                  <textarea
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{fullName || username}</h2>
                    <p className="text-gray-600">@{username}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    Chỉnh sửa
                  </button>
                </div>

                {bio && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-rose-500" />
                      <span className="font-medium text-gray-700">Giới thiệu</span>
                    </div>
                    <p className="text-gray-600">{bio}</p>
                  </div>
                )}

                {goals && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-rose-500" />
                      <span className="font-medium text-gray-700">Mục tiêu</span>
                    </div>
                    <p className="text-gray-600">{goals}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-rose-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-rose-600">{userStats.posts}</p>
                    <p className="text-sm text-gray-600">Bài viết</p>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-pink-600">{userStats.likes}</p>
                    <p className="text-sm text-gray-600">Yêu thích</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{userStats.achievements}</p>
                    <p className="text-sm text-gray-600">Huy hiệu</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-6 h-6 text-rose-500" />
          <h3 className="text-xl font-bold text-gray-900">Huy hiệu thành tựu</h3>
        </div>

        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl">
                  {achievement.badge_type === 'posts' && '📝'}
                  {achievement.badge_type === 'likes' && '❤️'}
                  {achievement.badge_type === 'habits' && '🎯'}
                  {achievement.badge_type === 'challenges' && '🏆'}
                  {achievement.badge_type === 'community' && '👥'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{achievement.badge_name}</p>
                  <p className="text-sm text-gray-600">{achievement.badge_description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(achievement.earned_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Heart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Chưa có huy hiệu nào. Hãy tích cực tham gia để nhận huy hiệu!</p>
          </div>
        )}
      </div>
    </div>
  );
};
