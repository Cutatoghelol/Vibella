import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Moon, Droplets, Footprints, Brain, Calendar } from 'lucide-react';

export const HabitTracker = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [habits, setHabits] = useState({
    sleep_hours: 0,
    water_glasses: 0,
    steps: 0,
    meditation_minutes: 0,
  });
  const [weekData, setWeekData] = useState<any[]>([]);

  useEffect(() => {
    loadHabits();
    loadWeekData();
  }, [selectedDate]);

  const loadHabits = async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', selectedDate)
      .maybeSingle();

    if (data) {
      setHabits({
        sleep_hours: data.sleep_hours || 0,
        water_glasses: data.water_glasses || 0,
        steps: data.steps || 0,
        meditation_minutes: data.meditation_minutes || 0,
      });
    } else {
      setHabits({ sleep_hours: 0, water_glasses: 0, steps: 0, meditation_minutes: 0 });
    }
  };

  const loadWeekData = async () => {
    if (!user?.id) return;

    const today = new Date(selectedDate);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);

    const { data } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', weekAgo.toISOString().split('T')[0])
      .lte('date', selectedDate)
      .order('date', { ascending: true });

    setWeekData(data || []);
  };

  const saveHabit = async (field: string, value: number) => {
    if (!user?.id) return;

    const updatedHabits = { ...habits, [field]: value };
    setHabits(updatedHabits);

    const { error } = await supabase.from('habits').upsert({
      user_id: user.id,
      date: selectedDate,
      ...updatedHabits,
    });

    if (!error) {
      loadWeekData();
    }
  };

  const getWeekAverage = (field: string) => {
    if (weekData.length === 0) return 0;
    const sum = weekData.reduce((acc, day) => acc + (day[field] || 0), 0);
    return Math.round(sum / weekData.length);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-rose-500" />
            <h2 className="text-2xl font-bold text-gray-900">Theo dõi thói quen</h2>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HabitCard
            icon={<Moon className="w-8 h-8 text-rose-500" />}
            title="Giấc ngủ"
            value={habits.sleep_hours}
            unit="giờ"
            goal={8}
            color="rose"
            onChange={(value) => saveHabit('sleep_hours', value)}
          />
          <HabitCard
            icon={<Droplets className="w-8 h-8 text-blue-500" />}
            title="Nước uống"
            value={habits.water_glasses}
            unit="ly"
            goal={8}
            color="blue"
            onChange={(value) => saveHabit('water_glasses', value)}
          />
          <HabitCard
            icon={<Footprints className="w-8 h-8 text-green-500" />}
            title="Bước đi"
            value={habits.steps}
            unit="bước"
            goal={10000}
            color="green"
            step={1000}
            onChange={(value) => saveHabit('steps', value)}
          />
          <HabitCard
            icon={<Brain className="w-8 h-8 text-purple-500" />}
            title="Thiền"
            value={habits.meditation_minutes}
            unit="phút"
            goal={20}
            color="purple"
            onChange={(value) => saveHabit('meditation_minutes', value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Thống kê 7 ngày</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-rose-50 rounded-lg p-4 text-center">
            <Moon className="w-6 h-6 text-rose-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-rose-600">{getWeekAverage('sleep_hours')}</p>
            <p className="text-sm text-gray-600">TB Giấc ngủ (giờ)</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{getWeekAverage('water_glasses')}</p>
            <p className="text-sm text-gray-600">TB Nước (ly)</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Footprints className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{getWeekAverage('steps')}</p>
            <p className="text-sm text-gray-600">TB Bước đi</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Brain className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{getWeekAverage('meditation_minutes')}</p>
            <p className="text-sm text-gray-600">TB Thiền (phút)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HabitCard = ({
  icon,
  title,
  value,
  unit,
  goal,
  color,
  step = 1,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  unit: string;
  goal: number;
  color: string;
  step?: number;
  onChange: (value: number) => void;
}) => {
  const percentage = Math.min((value / goal) * 100, 100);

  const colorClasses = {
    rose: 'bg-rose-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  }[color];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">Mục tiêu: {goal} {unit}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          <span className="text-sm text-gray-600">{unit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${colorClasses} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{Math.round(percentage)}% hoàn thành</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onChange(Math.max(0, value - step))}
          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          -
        </button>
        <button
          onClick={() => onChange(value + step)}
          className={`flex-1 px-3 py-2 ${colorClasses} text-white rounded-lg hover:opacity-90 transition-opacity`}
        >
          +
        </button>
      </div>
    </div>
  );
};
