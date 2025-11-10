import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Target, Award, Heart, Key, Upload, X } from 'lucide-react';

export const Profile = () => {
  const { profile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [goals, setGoals] = useState(profile?.goals || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [userStats, setUserStats] = useState({ posts: 0, likesGiven: 0, likesReceived: 0, achievements: 0 });
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

    const { count: likesGivenCount } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: achievementsCount } = await supabase
      .from('achievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('likes_received')
      .eq('id', user.id)
      .maybeSingle();

    setUserStats({
      posts: postsCount || 0,
      likesGiven: likesGivenCount || 0,
      likesReceived: profileData?.likes_received || 0,
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ảnh không được vượt quá 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        alert('Đã xảy ra lỗi khi upload ảnh');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newAvatarUrl = urlData.publicUrl;
      setAvatarUrl(newAvatarUrl);

      await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error:', error);
      alert('Đã xảy ra lỗi');
    } finally {
      setUploadingAvatar(false);
    }
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

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: currentPassword,
    });

    if (signInError) {
      setPasswordError('Mật khẩu hiện tại không đúng');
      return;
    }

    // Update to new password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(error.message);
      return;
    }

    setPasswordSuccess('Đổi mật khẩu thành công!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setShowChangePassword(false);
      setPasswordSuccess('');
    }, 2000);
  };

  const handleForgotPassword = async () => {
    if (!user?.email) return;

    setPasswordError('');
    setPasswordSuccess('');

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}`,
    });

    if (error) {
      setPasswordError('Không thể gửi email. Vui lòng thử lại.');
      return;
    }

    setPasswordSuccess('Đã gửi email đặt lại mật khẩu! Vui lòng kiểm tra hộp thư.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center">
            <div className="relative">
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
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center cursor-pointer text-white shadow-lg transition-colors">
                  {uploadingAvatar ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              )}
            </div>
            {isEditing && avatarUrl && (
              <button
                onClick={() => setAvatarUrl('')}
                className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Xóa ảnh
              </button>
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Key className="w-4 h-4" />
                      Đổi mật khẩu
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-rose-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-rose-600">{userStats.posts}</p>
                    <p className="text-sm text-gray-600">Bài viết</p>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-pink-600">{userStats.likesReceived}</p>
                    <p className="text-sm text-gray-600">Được thích</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{userStats.likesGiven}</p>
                    <p className="text-sm text-gray-600">Đã thích</p>
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

      {showChangePassword && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-6 h-6 text-rose-500" />
            <h3 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h3>
          </div>

          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Ít nhất 6 ký tự"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {passwordSuccess}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button
                  onClick={handleChangePassword}
                  className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all"
                >
                  Đổi mật khẩu
                </button>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
              </div>
              <button
                onClick={handleForgotPassword}
                className="text-sm text-rose-600 hover:text-rose-700 text-left"
              >
                Quên mật khẩu? Nhận email đặt lại
              </button>
            </div>
          </div>
        </div>
      )}

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
