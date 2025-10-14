import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Video, Eye, Clock } from 'lucide-react';

export const ExpertContent = () => {
  const [contents, setContents] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'blog' | 'video'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [filter]);

  const loadContent = async () => {
    setLoading(true);
    let query = supabase
      .from('expert_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('content_type', filter);
    }

    const { data } = await query;
    setContents(data || []);
    setLoading(false);
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Nội dung chuyên gia</h2>
        </div>
        <p className="text-rose-100">Kiến thức và lời khuyên từ các chuyên gia sức khỏe tinh thần</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter('blog')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'blog'
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Bài viết
        </button>
        <button
          onClick={() => setFilter('video')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'video'
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Video
        </button>
      </div>

      {contents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Chưa có nội dung nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((content) => (
            <div
              key={content.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {content.thumbnail_url && (
                <div className="relative">
                  <img
                    src={content.thumbnail_url}
                    alt={content.title}
                    className="w-full h-48 object-cover"
                  />
                  {content.content_type === 'video' && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <Video className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {content.content_type === 'blog' ? (
                    <BookOpen className="w-5 h-5 text-rose-500" />
                  ) : (
                    <Video className="w-5 h-5 text-rose-500" />
                  )}
                  <span className="text-xs font-medium text-rose-600 uppercase">
                    {content.content_type === 'blog' ? 'Bài viết' : 'Video'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{content.title}</h3>
                <p className="text-sm text-gray-600 mb-3">Bởi {content.author}</p>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{content.content}</p>

                {content.topics && content.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {content.topics.slice(0, 3).map((topic: string) => (
                      <span
                        key={topic}
                        className="px-2 py-1 bg-rose-50 text-rose-600 rounded text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{content.views_count} lượt xem</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(content.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all">
                  {content.content_type === 'blog' ? 'Đọc bài viết' : 'Xem video'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
