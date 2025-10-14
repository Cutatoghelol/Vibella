import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export const AIChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý sức khỏe tinh thần của bạn. Tôi có thể giúp bạn với các vấn đề về căng thẳng, lo âu, và cải thiện sức khỏe tinh thần. Bạn cần hỗ trợ điều gì hôm nay?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickResponses = [
    'Làm sao để giảm căng thẳng?',
    'Tôi cảm thấy lo âu',
    'Cách cải thiện giấc ngủ',
    'Bài tập thở sâu',
  ];

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('căng thẳng') || lowerMessage.includes('stress')) {
      return 'Để giảm căng thẳng, bạn có thể thử:\n\n1. Thực hành hít thở sâu: Hít vào 4 giây, giữ 4 giây, thở ra 4 giây\n2. Tập thiền 10-15 phút mỗi ngày\n3. Tập thể dục nhẹ nhàng như đi bộ, yoga\n4. Nghe nhạc thư giãn\n5. Viết nhật ký cảm xúc\n\nHãy nhớ rằng việc chăm sóc bản thân là điều quan trọng!';
    }

    if (lowerMessage.includes('lo âu') || lowerMessage.includes('anxiety') || lowerMessage.includes('lo lắng')) {
      return 'Tôi hiểu bạn đang cảm thấy lo âu. Đây là những cách có thể giúp bạn:\n\n1. Kỹ thuật 5-4-3-2-1: Nhìn 5 thứ, chạm 4 thứ, nghe 3 âm thanh, ngửi 2 mùi, nếm 1 vị\n2. Viết ra những điều bạn lo lắng\n3. Nói chuyện với người bạn tin tưởng\n4. Tập trung vào hiện tại, không nghĩ quá nhiều về tương lai\n5. Tập yoga hoặc thiền\n\nNếu lo âu kéo dài, hãy tìm sự hỗ trợ từ chuyên gia!';
    }

    if (lowerMessage.includes('giấc ngủ') || lowerMessage.includes('ngủ') || lowerMessage.includes('sleep')) {
      return 'Để cải thiện giấc ngủ, hãy thử:\n\n1. Đi ngủ và thức dậy cùng giờ mỗi ngày\n2. Tránh caffeine sau 2 giờ chiều\n3. Tắt điện thoại 1 giờ trước khi ngủ\n4. Tạo môi trường phòng ngủ thoải mái, tối và mát\n5. Đọc sách hoặc nghe nhạc nhẹ trước khi ngủ\n6. Tránh ăn no quá trước khi ngủ\n\nGiấc ngủ tốt là nền tảng của sức khỏe tinh thần!';
    }

    if (lowerMessage.includes('thở') || lowerMessage.includes('hơi thở')) {
      return 'Bài tập thở sâu đơn giản:\n\n1. Ngồi thoải mái, lưng thẳng\n2. Đặt một tay lên ngực, một tay lên bụng\n3. Hít vào chậm qua mũi trong 4 giây\n4. Giữ hơi trong 4 giây\n5. Thở ra chậm qua miệng trong 6 giây\n6. Lặp lại 5-10 lần\n\nThực hành hàng ngày sẽ giúp bạn cảm thấy bình yên hơn!';
    }

    if (lowerMessage.includes('thiền') || lowerMessage.includes('meditation')) {
      return 'Hướng dẫn thiền cơ bản:\n\n1. Tìm nơi yên tĩnh\n2. Ngồi thoải mái, có thể bắt chéo chân\n3. Nhắm mắt nhẹ nhàng\n4. Tập trung vào hơi thở\n5. Khi tâm trí lang thang, nhẹ nhàng đưa về hơi thở\n6. Bắt đầu với 5-10 phút, tăng dần\n\nThiền đều đặn giúp giảm stress và tăng sự tập trung!';
    }

    return 'Cảm ơn bạn đã chia sẻ. Tôi ở đây để lắng nghe và hỗ trợ bạn. Một số chủ đề tôi có thể giúp:\n\n• Quản lý căng thẳng\n• Giảm lo âu\n• Cải thiện giấc ngủ\n• Kỹ thuật thở và thiền\n• Xây dựng thói quen tích cực\n\nBạn muốn tìm hiểu về chủ đề nào?';
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const aiResponse: Message = {
        role: 'assistant',
        content: getAIResponse(input),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setLoading(false);
    }, 1000);
  };

  const handleQuickResponse = (text: string) => {
    setInput(text);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ height: '70vh' }}>
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Trợ lý sức khỏe tinh thần</h2>
              <p className="text-rose-100 text-sm">Luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickResponses.map((text) => (
              <button
                key={text}
                onClick={() => handleQuickResponse(text)}
                className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-sm hover:bg-rose-100 transition-colors"
              >
                {text}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
