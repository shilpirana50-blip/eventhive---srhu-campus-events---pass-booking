import React, { useState } from 'react';
import { Sparkles, Send, Calendar, ArrowRight, Bot, Compass } from 'lucide-react';
import { Event } from '../types';
import { callAiAssistant } from '../lib/api';

interface AiAssistantModalProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onClose: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ events, onSelectEvent, onClose }) => {
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    explanation: string;
    suggestedIds: string[];
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsLoading(true);
    setRecommendation(null);

    try {
      const res = await callAiAssistant('recommend', promptText);
      setRecommendation(res);
    } catch (err: any) {
      alert('AI Assistant error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedEvents = events.filter((e) => recommendation?.suggestedIds?.includes(e.id));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl w-full max-w-xl border border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">
                Gemini Powered
              </span>
              <h2 className="text-xl font-black">AI Event Concierge</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-300">
            Tell me what you feel like doing this week! (e.g., <i>"I want a relaxed outdoors evening with craft drinks and live jazz music"</i> or <i>"Find me tech networking events for startup founders"</i>).
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. Live jazz and food tasting events..."
              className="flex-1 px-4 py-2.5 text-xs bg-slate-950 border rounded-xl border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Thinking...' : 'Discover'}</span>
            </button>
          </form>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <button
              onClick={() => setPromptText('Live jazz and outdoor craft beer nights')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              🎷 Jazz & Craft Beer
            </button>
            <button
              onClick={() => setPromptText('Tech, coding, and AI networking summit')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              💻 Tech & AI Summit
            </button>
            <button
              onClick={() => setPromptText('Morning yoga and meditation sound bath')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              🧘 Sunrise Yoga
            </button>
          </div>

          {/* AI Result Card */}
          {recommendation && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>AI Concierge Pick</span>
              </div>
              <p className="text-slate-300 italic">{recommendation.explanation}</p>

              {suggestedEvents.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  {suggestedEvents.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => {
                        onSelectEvent(evt);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white block">{evt.title}</span>
                        <span className="text-[10px] text-slate-400">{evt.date} • {evt.location}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 pt-1">
                  Explore all featured events in the browse tab!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
