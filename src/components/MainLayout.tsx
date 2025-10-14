import { useState } from 'react';
import { Home, User, Trophy, BookOpen, MessageCircle, BarChart3, Target, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NewsFeed } from './NewsFeed';
import { Profile } from './Profile';
import { Challenges } from './Challenges';
import { ExpertContent } from './ExpertContent';
import { AIChatbot } from './AIChatbot';
import { Leaderboard } from './Leaderboard';
import { HabitTracker } from './HabitTracker';

type Tab = 'home' | 'profile' | 'challenges' | 'expert' | 'chat' | 'leaderboard' | 'habits';

export const MainLayout = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Wellness Circle
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Xin chào, {profile?.username || 'User'}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <nav className="bg-white rounded-xl shadow-sm mb-6 p-2 flex gap-2 overflow-x-auto">
          <NavButton
            icon={<Home className="w-5 h-5" />}
            label="Trang chủ"
            active={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
          />
          <NavButton
            icon={<User className="w-5 h-5" />}
            label="Hồ sơ"
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
          <NavButton
            icon={<Target className="w-5 h-5" />}
            label="Thói quen"
            active={activeTab === 'habits'}
            onClick={() => setActiveTab('habits')}
          />
          <NavButton
            icon={<Trophy className="w-5 h-5" />}
            label="Thử thách"
            active={activeTab === 'challenges'}
            onClick={() => setActiveTab('challenges')}
          />
          <NavButton
            icon={<BarChart3 className="w-5 h-5" />}
            label="Bảng xếp hạng"
            active={activeTab === 'leaderboard'}
            onClick={() => setActiveTab('leaderboard')}
          />
          <NavButton
            icon={<BookOpen className="w-5 h-5" />}
            label="Chuyên gia"
            active={activeTab === 'expert'}
            onClick={() => setActiveTab('expert')}
          />
          <NavButton
            icon={<MessageCircle className="w-5 h-5" />}
            label="AI Trợ lý"
            active={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
          />
        </nav>

        <main>
          {activeTab === 'home' && <NewsFeed />}
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'habits' && <HabitTracker />}
          {activeTab === 'challenges' && <Challenges />}
          {activeTab === 'leaderboard' && <Leaderboard />}
          {activeTab === 'expert' && <ExpertContent />}
          {activeTab === 'chat' && <AIChatbot />}
        </main>
      </div>
    </div>
  );
};

const NavButton = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
      active
        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);
