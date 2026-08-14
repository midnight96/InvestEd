import { useState, useRef, useEffect } from 'react';
import client from '../api/client';

export default function Coach() {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "👋 Hi! I'm your **InvestEd AI Coach**. You can ask me any question about stock markets, mutual funds, personal budgeting, inflation, or how to diversify your portfolio. What would you like to learn today? 🚀"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  // Suggestions that users can click to ask instantly
  const suggestions = [
    "Explain compound interest to a 15-year-old.",
    "What is the difference between a growth fund and a dividend stock?",
    "How does inflation affect my savings over time?",
    "Give me an analogy for diversification."
  ];

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(textToSend) {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) setInputText('');
    setError('');

    // Add user message to history
    const userMessage = { role: 'user', text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // API call to the backend
      const response = await client.post('/lessons/chatbot/', {
        messages: updatedMessages
      });

      if (response.data && response.data.text) {
        setMessages((prev) => [
          ...prev,
          { role: 'model', text: response.data.text }
        ]);
      } else {
        setError('Received an empty response from the AI coach.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to contact your AI Coach. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Simple Markdown parsing helper
  function renderMessageText(text) {
    if (!text) return '';
    // Replace **text** with <strong>text</strong>
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Split by newlines to handle lists and paragraph breaks
    const lines = html.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc my-1" dangerouslySetInnerHTML={{ __html: trimmed.slice(2) }} />
        );
      }
      return trimmed ? (
        <p key={idx} className="my-1.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: trimmed }} />
      ) : (
        <div key={idx} className="h-2" />
      );
    });
  }

  return (
    <div className="app-page flex flex-col h-screen" style={{ paddingBottom: '20px' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#292929] mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>🤖</span> AI Financial Coach
          </h1>
          <p className="text-xs text-[#777] mt-1">Your friendly personal assistant for learning smart investing</p>
        </div>
        <div className="flex items-center gap-2 bg-[#173322] px-3 py-1.5 rounded-full text-xs text-[#64e67d] font-semibold">
          <span className="w-2 height-2 w-2 h-2 rounded-full bg-[#64e67d] animate-pulse"></span>
          Online
        </div>
      </div>

      {/* Main chat layout */}
      <div className="flex-1 flex flex-col md:flex-row gap-5 overflow-hidden">
        {/* Left Column: Chat History */}
        <div className="flex-1 flex flex-col bg-[#121212] border border-[#2b2b2b] rounded-2xl overflow-hidden relative">
          
          {/* Scrollable Message Box */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all duration-200 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#2579e9] to-[#5267ea] text-white rounded-br-none'
                      : 'bg-[#1b1b1b] border border-[#2b2b2b] text-[#eee] rounded-bl-none'
                  }`}
                >
                  {/* Coach Identifier */}
                  {msg.role === 'model' && (
                    <div className="text-[10px] uppercase font-bold text-[#ff426c] mb-1 tracking-wider">
                      Coach
                    </div>
                  )}
                  <div className="space-y-1">{renderMessageText(msg.text)}</div>
                </div>
              </div>
            ))}

            {/* Loading / Typing Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1b1b1b] border border-[#2b2b2b] max-w-[80%] rounded-2xl rounded-bl-none px-4 py-3 text-sm text-[#888] flex items-center gap-2">
                  <div className="text-[10px] uppercase font-bold text-[#ff426c] tracking-wider mr-1">
                    Coach
                  </div>
                  <span className="flex space-x-1 items-center">
                    <span className="w-1.5 h-1.5 bg-[#888] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#888] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#888] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-[#451d29] border border-[#ff5574] text-[#ff5574] rounded-xl text-xs">
                ⚠️ {error}
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Input Panel */}
          <div className="p-4 border-t border-[#2b2b2b] bg-[#161616] flex gap-3">
            <textarea
              className="flex-1 bg-[#090909] border border-[#2b2b2b] rounded-xl p-3 text-sm text-[#eee] outline-none placeholder-[#555] resize-none focus:border-[#ff3f69] focus:ring-1 focus:ring-[#ff3f69] transition-all"
              rows={2}
              placeholder="Ask anything (e.g. How does inflation work?)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputText.trim()}
              className="px-5 bg-gradient-to-r from-[#ff315d] to-[#a653fc] hover:brightness-110 active:brightness-95 text-white font-semibold rounded-xl text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              Send 🚀
            </button>
          </div>
        </div>

        {/* Right Column: Suggested Topics / Prompts */}
        <div className="w-full md:w-[320px] flex flex-col gap-4">
          <div className="p-4 bg-gradient-to-br from-[#1b1b1b] to-[#101010] border border-[#2b2b2b] rounded-2xl">
            <h3 className="text-xs uppercase font-bold tracking-wider text-[#ff426c] mb-3">
              💡 Suggested Questions
            </h3>
            <p className="text-xs text-[#888] mb-4">
              Click any of the questions below to ask your AI Financial Coach instantly:
            </p>
            <div className="space-y-2.5">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(suggestion)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-xl border border-[#2c2c2c] bg-[#151515] hover:bg-[#202020] text-xs text-[#ccc] hover:text-white transition-all cursor-pointer leading-normal"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-[#1b1b1b] to-[#101010] border border-[#2b2b2b] rounded-2xl text-xs text-[#888] space-y-2">
            <h3 className="text-xs uppercase font-bold tracking-wider text-white mb-2">
              📖 Tip
            </h3>
            <p>
              Your Coach is configured to guide you step-by-step. Feel free to follow up on complex answers:
            </p>
            <p className="italic text-[#aaa]">
              "Can you give me another analogy for that?"
            </p>
            <p className="italic text-[#aaa]">
              "How does that relate to a mutual fund?"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
