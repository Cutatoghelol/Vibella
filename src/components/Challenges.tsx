import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Trophy, Users, Target, CheckCircle } from 'lucide-react';

export const Challenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('challenges')
      .select('*, challenge_participants(*)')
      .order('start_date', { ascending: false });

    setChallenges(data || []);
    setLoading(false);
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user?.id) return;

    const { error } = await supabase.from('challenge_participants').insert({
      challenge_id: challengeId,
      user_id: user.id,
    });

    if (!error) {
      loadChallenges();
    }
  };

  const isParticipating = (challenge: any) => {
    return challenge.challenge_participants?.some((p: any) => p.user_id === user?.id);
  };

  const getGoalIcon = (goalType: string) => {
    const icons: any = {
      steps: '👣',
      meditation: '🧘',
      water: '💧',
      sleep: '😴',
    };
    return icons[goalType] || '🎯';
  };

  const getGoalLabel = (goalType: string) => {
    const labels: any = {
      steps: 'bước',
      meditation: 'phút',
      water: 'ly',
      sleep: 'giờ',
    };
    return labels[goalType] || '';
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
          <h2 className="text-2xl font-bold">Thử thách cộng đồng</h2>
        </div>
        <p className="text-rose-100">Tham gia thử thách cùng cộng đồng để cải thiện sức khỏe!</p>
      </div>

      {challenges.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Chưa có thử thách nào. Hãy quay lại sau!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{getGoalIcon(challenge.goal_type)}</span>
                    <h3 className="text-xl font-bold text-gray-900">{challenge.title}</h3>
                    {isParticipating(challenge) && (
                      <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">
                        Đã tham gia
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{challenge.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-rose-500" />
                      <span className="text-gray-700">
                        Mục tiêu: <strong>{challenge.goal_value} {getGoalLabel(challenge.goal_type)}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-rose-500" />
                      <span className="text-gray-700">
                        <strong>{challenge.participants_count}</strong> người tham gia
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      {new Date(challenge.start_date).toLocaleDateString('vi-VN')} -{' '}
                      {new Date(challenge.end_date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                {!isParticipating(challenge) && (
                  <button
                    onClick={() => joinChallenge(challenge.id)}
                    className="ml-4 px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all shadow-md"
                  >
                    Tham gia
                  </button>
                )}
              </div>

              {isParticipating(challenge) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Tiến độ của bạn</span>
                    <span className="text-sm text-gray-600">
                      {challenge.challenge_participants.find((p: any) => p.user_id === user?.id)?.progress || 0} /{' '}
                      {challenge.goal_value}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-pink-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          ((challenge.challenge_participants.find((p: any) => p.user_id === user?.id)?.progress ||
                            0) /
                            challenge.goal_value) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
