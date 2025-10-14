import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Crown, Medal, TrendingUp } from 'lucide-react';

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const { data } = await supabase
      .from('leaderboard_scores')
      .select('*, profiles(*)')
      .eq('week_start', weekStartStr)
      .order('score', { ascending: false })
      .limit(10);

    setLeaderboard(data || []);
    setLoading(false);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-600">{index + 1}</span>;
  };

  const getRankBg = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
    if (index === 1) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
    if (index === 2) return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
    return 'bg-white border-gray-200';
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Đang tải...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Bảng xếp hạng năng lượng tích cực</h2>
        </div>
        <p className="text-rose-100">Top 10 người lan tỏa năng lượng tốt nhất tuần này</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Chưa có dữ liệu xếp hạng cho tuần này.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              className={`${getRankBg(index)} rounded-xl border-2 p-6 hover:shadow-md transition-all`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">{getRankIcon(index)}</div>

                <div className="flex-shrink-0">
                  {entry.profiles?.avatar_url ? (
                    <img
                      src={entry.profiles.avatar_url}
                      alt={entry.profiles.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-rose-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      {entry.profiles?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">
                      {entry.profiles?.full_name || entry.profiles?.username}
                    </h3>
                    {index === 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Người dẫn đầu
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">@{entry.profiles?.username}</p>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-rose-600">{entry.score}</div>
                  <div className="text-xs text-gray-600">điểm</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{entry.posts_count}</div>
                  <div className="text-xs text-gray-600">Bài viết</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{entry.likes_given}</div>
                  <div className="text-xs text-gray-600">Lượt thích</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{entry.comments_given}</div>
                  <div className="text-xs text-gray-600">Bình luận</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
        <h4 className="font-semibold text-rose-900 mb-2">Cách tính điểm:</h4>
        <ul className="text-sm text-rose-800 space-y-1">
          <li>• Mỗi bài viết: +10 điểm</li>
          <li>• Mỗi lượt thích cho người khác: +2 điểm</li>
          <li>• Mỗi bình luận tích cực: +5 điểm</li>
        </ul>
      </div>
    </div>
  );
};
