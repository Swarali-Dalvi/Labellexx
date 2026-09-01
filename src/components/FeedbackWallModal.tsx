import React, { useState } from 'react';
import { MessageSquareQuote, Star, Plus, X, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { useSharedStore, AnonymousFeedback } from '../store/sharedStore';

interface FeedbackWallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedbackForm: () => void;
}

export const FeedbackWallModal: React.FC<FeedbackWallModalProps> = ({
  isOpen,
  onClose,
  onOpenFeedbackForm
}) => {
  const { feedbacks, language } = useSharedStore();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredFeedbacks = filterCategory === 'all'
    ? feedbacks
    : feedbacks.filter(f => f.category === filterCategory);

  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / feedbacks.length).toFixed(1)
    : '5.0';

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/70 backdrop-blur-sm animate-fadeIn no-print">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl border border-charcoal-200 shadow-soft-2xl flex flex-col overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-charcoal-100 bg-cream-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-charcoal-900 flex items-center justify-center shadow-soft-sm">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-charcoal-900">
                  {language === 'hi' ? 'सार्वजनिक प्रतिक्रिया एवं सुझाव' : 'Public Feedback & Suggestions'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {feedbacks.length} {language === 'hi' ? 'प्रविष्टियां' : 'Entries'}
                </span>
              </div>
              <p className="text-xs text-charcoal-500">
                {language === 'hi' ? 'समुदाय द्वारा साझा किए गए गुमनाम सुझाव' : 'Completely anonymous community feedback & feature ideas'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => { onClose(); onOpenFeedbackForm(); }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-charcoal-900 hover:bg-charcoal-800 text-white shadow-soft-sm transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-pastel-mint" />
              <span>{language === 'hi' ? 'प्रतिक्रिया दें' : 'Give Feedback'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl hover:bg-cream-100 text-charcoal-400 hover:text-charcoal-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats & Category Filter Bar */}
        <div className="px-6 py-3 border-b border-charcoal-100 bg-white flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-3 text-xs text-charcoal-600 font-medium">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <strong className="text-charcoal-900">{averageRating}</strong>
              <span className="text-charcoal-400">/ 5.0 rating</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Anonymous</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 text-xs">
            {['all', 'suggestion', 'feature', 'accuracy', 'general'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-charcoal-900 text-white shadow-soft-xs'
                    : 'bg-cream-100 text-charcoal-600 hover:bg-cream-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Cards List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-cream-50/30">
          {filteredFeedbacks.length > 0 ? (
            filteredFeedbacks.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-charcoal-200 shadow-soft-sm space-y-2.5 hover:border-charcoal-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= (item.rating || 5)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-charcoal-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-cream-100 text-charcoal-700 border border-charcoal-200">
                      {item.category || 'General'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-charcoal-400 font-medium">
                    <span>👤 Anonymous Contributor</span>
                    <span>•</span>
                    <span>{formatTimeAgo(item.timestamp)}</span>
                  </div>
                </div>

                <p className="text-xs text-charcoal-800 font-medium leading-relaxed">
                  "{item.comment}"
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-charcoal-400 text-xs">
              No feedback entries found under this category.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-charcoal-100 bg-cream-50/50 flex items-center justify-between text-[11px] text-charcoal-500 shrink-0">
          <span>All suggestions are publicly visible and stored anonymously.</span>
          <button
            onClick={() => { onClose(); onOpenFeedbackForm(); }}
            className="font-bold text-charcoal-800 hover:underline cursor-pointer"
          >
            Submit your feedback &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
