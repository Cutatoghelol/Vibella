import { useState, useEffect } from 'react';
import { supabase, Post } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, Send, Filter, X, Trash2 } from 'lucide-react';

const MOOD_EMOJIS = ['😊', '😌', '💪', '🌟', '🧘', '❤️', '🎯', '✨'];
const TOPICS = ['#thiền', '#thể_dục', '#selfcare', '#dinh_dưỡng', '#giấc_ngủ', '#yoga', '#tâm_lý'];

export const NewsFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [filterTopic, setFilterTopic] = useState<string | null>(null);
  const [showTopicFilter, setShowTopicFilter] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [filterTopic]);

  const loadPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('posts')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false });

    if (filterTopic) {
      query = query.contains('topics', [filterTopic]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading posts:', error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const createPost = async () => {
    if (!content.trim() && !imageUrl.trim()) return;

    const { error } = await supabase.from('posts').insert({
      user_id: user?.id,
      content: content.trim() || null,
      image_url: imageUrl.trim() || null,
      mood_emoji: selectedMood || null,
      topics: selectedTopics,
    });

    if (error) {
      console.error('Error creating post:', error);
      return;
    }

    setContent('');
    setImageUrl('');
    setSelectedMood('');
    setSelectedTopics([]);
    setShowCreatePost(false);
    loadPosts();
  };

  const toggleLike = async (postId: string, isLiked: boolean) => {
    if (!user?.id) return;

    if (isLiked) {
      await supabase.from('post_likes').delete().match({ post_id: postId, user_id: user.id });
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
    }

    await updatePostLikesCount(postId);
    loadPosts();
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const updatePostLikesCount = async (postId: string) => {
    const { count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    await supabase
      .from('posts')
      .update({ likes_count: count || 0 })
      .eq('id', postId);
  };

  const deletePost = async (postId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (!error) {
        loadPosts();
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setShowTopicFilter(!showTopicFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            Lọc theo chủ đề
          </button>
          {filterTopic && (
            <div className="flex items-center gap-2 px-3 py-2 bg-rose-100 text-rose-700 rounded-lg">
              {filterTopic}
              <button onClick={() => setFilterTopic(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {showTopicFilter && (
          <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 rounded-lg">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setFilterTopic(topic);
                  setShowTopicFilter(false);
                }}
                className="px-3 py-1 bg-white border border-gray-300 hover:border-rose-500 hover:text-rose-600 rounded-full text-sm transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        )}

        {!showCreatePost ? (
          <button
            onClick={() => setShowCreatePost(true)}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-gray-600 transition-colors"
          >
            Bạn đang nghĩ gì về sức khỏe hôm nay?
          </button>
        ) : (
          <div className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ hành trình sức khỏe của bạn..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              rows={3}
            />
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL hình ảnh (không bắt buộc)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />

            <div>
              <p className="text-sm text-gray-600 mb-2">Tâm trạng:</p>
              <div className="flex gap-2 flex-wrap">
                {MOOD_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedMood(emoji)}
                    className={`text-2xl p-2 rounded-lg transition-all ${
                      selectedMood === emoji ? 'bg-rose-100 scale-110' : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Chủ đề:</p>
              <div className="flex gap-2 flex-wrap">
                {TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedTopics.includes(topic)
                        ? 'bg-rose-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={createPost}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all"
              >
                <Send className="w-4 h-4" />
                Đăng bài
              </button>
              <button
                onClick={() => setShowCreatePost(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} onToggleLike={toggleLike} onDelete={deletePost} />)
      )}
    </div>
  );
};

const PostCard = ({
  post,
  onToggleLike,
  onDelete,
}: {
  post: Post;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onDelete: (postId: string) => void;
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    checkIfLiked();
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const checkIfLiked = async () => {
    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .match({ post_id: post.id, user_id: user?.id })
      .maybeSingle();
    setIsLiked(!!data);
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(*)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });
    setComments(data || []);
  };

  const addComment = async () => {
    if (!newComment.trim() || !user?.id) return;

    await supabase.from('comments').insert({
      post_id: post.id,
      user_id: user.id,
      content: newComment.trim(),
    });

    await updatePostCommentsCount();
    setNewComment('');
    loadComments();
  };

  const updatePostCommentsCount = async () => {
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id);

    await supabase
      .from('posts')
      .update({ comments_count: count || 0 })
      .eq('id', post.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
          {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{post.profiles?.username}</p>
          <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString('vi-VN')}</p>
        </div>
        {post.mood_emoji && <span className="text-2xl">{post.mood_emoji}</span>}
        {user?.id === post.user_id && (
          <button
            onClick={() => onDelete(post.id)}
            className="ml-auto p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa bài viết"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {post.content && <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>}

      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post"
          className="w-full rounded-lg mb-4 max-h-96 object-cover"
        />
      )}

      {post.topics && post.topics.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {post.topics.map((topic) => (
            <span key={topic} className="px-2 py-1 bg-rose-50 text-rose-600 rounded text-sm">
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => {
            setIsLiked(!isLiked);
            onToggleLike(post.id, isLiked);
          }}
          disabled={user?.id === post.user_id}
          className={`flex items-center gap-2 ${isLiked ? 'text-rose-500' : 'text-gray-600'} hover:text-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
          <span>{post.likes_count}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments_count}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">{comment.profiles?.username}</p>
                <p className="text-gray-700 text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addComment()}
            />
            <button
              onClick={addComment}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
