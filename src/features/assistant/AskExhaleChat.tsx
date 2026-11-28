import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Loader2,
  StopCircle,
  RotateCcw,
} from 'lucide-react';
import { ChatMessage } from '@/types';
import { useAppStore } from '@/shared/lib/store';
import { streamAskExhale, ChatHistoryItem } from '@/services/gemini';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { getSampleAirData } from '@/services/airquality';

const SUGGESTED_QUESTIONS = [
  'Can I run or workout outside today?',
  'Is it safe for my child to go to school?',
  'How do I build a DIY box fan filter?',
  'Which mask works best for PM2.5?',
  'When should I open my windows today?',
];

export const AskExhaleChat: React.FC = () => {
  const { profile, airQuality } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi, I'm Exhale. Ask me anything about today's smog levels, safe exercise windows, mask types, or indoor air filtration for your household.",
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const activeAir = airQuality || getSampleAirData();

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText ?? inputValue).trim();
    if (!textToSend || isStreaming) return;

    setInputValue('');

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = `assistant_${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    // Keep history of previous turns for multi-turn context
    const currentHistory: ChatHistoryItem[] = messages
      .filter((m) => m.content.trim().length > 0)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    await streamAskExhale(
      textToSend,
      profile,
      activeAir,
      (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: msg.content + chunk } : msg
          )
        );
      },
      currentHistory,
      abortControllerRef.current.signal
    );

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
      )
    );
    setIsStreaming(false);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        content: "Conversation cleared. What would you like to know about today's air?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <Card
      className="flex flex-col h-[640px] space-y-4"
      id="panel-assistant"
      role="tabpanel"
      aria-labelledby="nav-tab-assistant"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 shrink-0">
        <div>
          <h2 className="font-heading font-extrabold text-lg text-ink flex items-center gap-2">
            <span>Ask Exhale</span>
            <span className="text-xs font-normal text-muted">
              · Context: AQI {activeAir.aqi} ({activeAir.categoryLabel})
            </span>
          </h2>
          <p className="text-xs text-muted">
            Ask any question about exercise, health, masks, or air purifiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isStreaming ? (
            <button
              onClick={handleStop}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <StopCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={handleClear}
              title="Clear conversation"
              className="text-xs text-muted hover:text-ink font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Suggested Chips */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none shrink-0"
        role="toolbar"
        aria-label="Suggested questions"
      >
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isStreaming}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-canvas hover:border-gray-300 dark:hover:border-gray-600 text-muted hover:text-ink whitespace-nowrap transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm select-text"
        role="log"
        aria-live="polite"
        aria-label="Chat transcript"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-ink text-surface dark:bg-white dark:text-gray-900'
                    : 'bg-primary/10 text-primary-text'
                }`}
                aria-hidden="true"
              >
                {isUser ? 'You' : 'Ex'}
              </div>

              <div
                className={`p-4 rounded-2xl max-w-[85%] sm:max-w-[78%] space-y-2 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-ink text-white dark:bg-white dark:text-gray-900 rounded-tr-sm font-medium'
                    : 'bg-gray-50/80 dark:bg-gray-800/40 text-ink border border-gray-200/60 dark:border-gray-800/80 rounded-tl-sm'
                }`}
              >
                <p>{msg.content}</p>

                {msg.isStreaming && !msg.content && (
                  <div className="flex items-center gap-2 text-muted text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    <span>Thinking...</span>
                  </div>
                )}

                <div
                  className={`text-[10px] text-right pt-0.5 ${
                    isUser ? 'text-white/60 dark:text-black/60' : 'text-muted'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 shrink-0"
      >
        <label htmlFor="chat-query" className="sr-only">
          Ask a question about smog or air quality
        </label>
        <input
          id="chat-query"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask anything (e.g. Can I exercise outside? or What mask should I wear?)..."
          disabled={isStreaming}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-canvas text-ink text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={!inputValue.trim() || isStreaming}
          aria-label="Send message"
          className="h-10 px-4"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="w-4 h-4" aria-hidden="true" />
          )}
        </Button>
      </form>
    </Card>
  );
};
