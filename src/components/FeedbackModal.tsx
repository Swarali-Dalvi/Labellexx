import React, { useState } from 'react';
import { MessageSquarePlus, Star, X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useSharedStore } from '../store/sharedStore';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const { submitFeedback, language } = useSharedStore();
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<'suggestion' | 'feature' | 'accuracy' | 'general'>('suggestion');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    submitFeedback({
      comment: comment.trim(),
      rating,
      category
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setComment('');
      setRating(5);
      onClose();
      if (onSubmitted) onSubmitted();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/70 backdrop-blur-sm animate-fadeIn no-print">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-charcoal-200 shadow-soft-2xl overflow-hidden animate-scaleUp">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-100 bg-cream-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-charcoal-900">
                {language === 'hi' ? 'गुमनाम प्रतिक्रिया एवं सुझाव दें' : 'Give Anonymous Feedback'}
              </h3>
              <p className="text-[10px] text-charcoal-500">
                {language === 'hi' ? 'कोई व्यक्तिगत डेटा एकत्र नहीं किया जाता' : 'No personal data or login required'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-cream-100 text-charcoal-400 hover:text-charcoal-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold text-charcoal-900">
              {language === 'hi' ? 'प्रतिक्रिया सफलतापूर्वक सहेजी गई!' : 'Feedback Submitted Successfully!'}
            </h4>
            <p className="text-xs text-charcoal-500 max-w-xs mx-auto">
              {language === 'hi'
                ? 'आपका गुमनाम सुझाव सार्वजनिक प्रतिक्रिया बोर्ड पर जोड़ दिया गया है।'
                : 'Your anonymous suggestion has been recorded and posted to the public suggestions board.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* 100% Anonymous Hard Guarantee Notice */}
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-900">
                <span className="font-bold">100% Anonymous Guarantee:</span> We do not collect or store your name, email address, phone number, IP address, or user account info.
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-extrabold text-charcoal-800 mb-1.5">
                {language === 'hi' ? 'रेटिंग (1-5 स्टार)' : 'Overall Rating (Optional)'}
              </label>
              <div className="flex items-center space-x-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1.5 rounded-lg hover:bg-cream-100 transition-transform active:scale-90 cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        (hoverRating !== null ? star <= hoverRating : star <= rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-charcoal-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-charcoal-600 ml-2">
                  {rating === 5 ? '⭐⭐⭐⭐⭐ Excellent' : rating === 4 ? '⭐⭐⭐⭐ Good' : rating === 3 ? '⭐⭐⭐ Average' : rating === 2 ? '⭐⭐ Needs Work' : '⭐ Poor'}
                </span>
              </div>
            </div>

            {/* Category Pills */}
            <div>
              <label className="block text-xs font-extrabold text-charcoal-800 mb-1.5">
                {language === 'hi' ? 'प्रतिक्रिया श्रेणी' : 'Feedback Category'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'suggestion', label: 'Suggestion' },
                  { id: 'feature', label: 'Feature Idea' },
                  { id: 'accuracy', label: 'OCR Accuracy' },
                  { id: 'general', label: 'General' }
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      category === c.id
                        ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-soft-sm'
                        : 'bg-cream-50 text-charcoal-700 border-charcoal-200 hover:bg-cream-100'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Free-Text Box */}
            <div>
              <label className="block text-xs font-extrabold text-charcoal-800 mb-1.5">
                {language === 'hi' ? 'आपकी टिप्पणी / सुझाव *' : 'Your Suggestion / Comments *'}
              </label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like? What should we improve in our Legal Metrology scan or compliance reporting?"
                className="w-full p-3 rounded-2xl border border-charcoal-200 bg-cream-50/50 font-medium text-xs text-charcoal-900 outline-none focus:ring-2 focus:ring-charcoal-900 focus:bg-white transition-all placeholder:text-charcoal-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-charcoal-200 font-bold text-xs text-charcoal-600 hover:bg-cream-100 transition-colors cursor-pointer"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={!comment.trim()}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white shadow-soft-md transition-all ${
                  comment.trim()
                    ? 'bg-charcoal-900 hover:bg-charcoal-800 cursor-pointer hover:scale-101 active:scale-98'
                    : 'bg-charcoal-300 cursor-not-allowed'
                }`}
              >
                {language === 'hi' ? 'गुमनाम सबमिट करें' : 'Submit Feedback'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
