import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CHATBOT } from '@/constants/testIds';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'مرحباً بك في وهيبة فاشن! كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionId = useRef(`chat_${Date.now()}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(
        `${API}/chat/message?message=${encodeURIComponent(input)}&session_id=${sessionId.current}`,
        { method: 'POST' }
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6);
            assistantMessage += content;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1].content = assistantMessage;
              return newMessages;
            });
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        data-testid={CHATBOT.fab}
        onClick={() => setIsOpen(true)}
        className="chatbot-fab bg-burgundy-500 hover:bg-burgundy-600 text-white w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          data-testid={CHATBOT.dialog}
          className="sm:max-w-[500px] h-[600px] flex flex-col p-0 gap-0"
        >
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center justify-between font-tajawal">
              <span>المساعد الذكي</span>
              <button onClick={() => setIsOpen(false)} className="hover:bg-gray-100 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </DialogTitle>
          </DialogHeader>

          <div 
            data-testid={CHATBOT.messageList}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl font-cairo ${
                    message.role === 'user'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-burgundy-500 text-white'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-6 py-4 border-t">
            <div className="flex gap-2">
              <Input
                data-testid={CHATBOT.messageInput}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 font-cairo"
                disabled={loading}
              />
              <Button
                data-testid={CHATBOT.sendBtn}
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="bg-burgundy-500 hover:bg-burgundy-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Chatbot;
