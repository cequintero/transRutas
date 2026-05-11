import { ThumbsUp, ThumbsDown, Star, X } from 'lucide-react';
import { useState } from 'react';

interface FeedbackModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

export function FeedbackModal({ onClose, onSubmit }: FeedbackModalProps) {
  const [reaction, setReaction] = useState<'up' | 'down' | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    // Handle feedback submission
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-[0_12px_40px_rgba(0,0,0,0.14)] relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-[var(--snow-white)] rounded-lg transition-colors"
        >
          <X size={20} className="text-[var(--muted-gray)]" />
        </button>

        {/* Illustration */}
        <div className="flex justify-center mb-4">
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
            {/* Simple bus illustration */}
            <rect x="30" y="30" width="60" height="35" rx="4" fill="var(--trunk-route)" opacity="0.2"/>
            <rect x="35" y="35" width="50" height="25" rx="2" fill="var(--trunk-route)"/>
            <circle cx="45" cy="67" r="5" fill="var(--charcoal)"/>
            <circle cx="75" cy="67" r="5" fill="var(--charcoal)"/>
            {/* Speech bubble */}
            <circle cx="85" cy="25" r="12" fill="var(--sky-mist)"/>
            <path d="M 85 35 L 80 40 L 90 40 Z" fill="var(--sky-mist)"/>
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-[24px] font-bold leading-[1.2] tracking-[-0.02em] text-[var(--near-black)] text-center mb-6">
          ¿Cómo fue tu experiencia?
        </h2>

        {/* Quick Reaction */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setReaction('up')}
            className={`flex-1 py-4 rounded-xl border-2 transition-all ${
              reaction === 'up'
                ? 'border-[var(--fresh-green)] bg-[var(--mint-wash)]'
                : 'border-[var(--soft-gray)] bg-white hover:border-[var(--fresh-green)]'
            }`}
          >
            <ThumbsUp
              size={32}
              className={`mx-auto ${
                reaction === 'up' ? 'text-[var(--fresh-green)]' : 'text-[var(--muted-gray)]'
              }`}
              fill={reaction === 'up' ? 'var(--fresh-green)' : 'none'}
            />
          </button>
          <button
            onClick={() => setReaction('down')}
            className={`flex-1 py-4 rounded-xl border-2 transition-all ${
              reaction === 'down'
                ? 'border-[var(--alert-red)] bg-[var(--rose-wash)]'
                : 'border-[var(--soft-gray)] bg-white hover:border-[var(--alert-red)]'
            }`}
          >
            <ThumbsDown
              size={32}
              className={`mx-auto ${
                reaction === 'down' ? 'text-[var(--alert-red)]' : 'text-[var(--muted-gray)]'
              }`}
              fill={reaction === 'down' ? 'var(--alert-red)' : 'none'}
            />
          </button>
        </div>

        {/* Star Rating */}
        <div className="mb-6">
          <label className="block text-[15px] font-medium text-[var(--near-black)] mb-2">
            Precisión de la ruta
          </label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={star <= rating ? 'text-[var(--warm-amber)]' : 'text-[var(--soft-gray)]'}
                  fill={star <= rating ? 'var(--warm-amber)' : 'none'}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Text Feedback */}
        <div className="mb-6">
          <label className="block text-[15px] font-medium text-[var(--near-black)] mb-2">
            Cuéntanos más (opcional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Comparte tu experiencia con nosotros..."
            rows={4}
            className="w-full px-4 py-3 bg-white border border-[var(--soft-gray)] rounded-xl text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--transmi-red)] focus:border-transparent placeholder:text-[var(--muted-gray)]"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-[var(--transmi-red)] text-white rounded-xl text-[15px] font-semibold shadow-md hover:bg-[var(--deep-red)] transition-all active:scale-[0.98] mb-2"
        >
          Enviar opinión
        </button>

        {/* Dismiss Link */}
        <button
          onClick={onClose}
          className="w-full py-2 text-[var(--muted-gray)] text-[13px] hover:text-[var(--charcoal)] transition-colors"
        >
          Ahora no
        </button>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
