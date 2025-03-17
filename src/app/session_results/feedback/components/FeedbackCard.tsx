'use client';

type FeedbackCardProps = {
  feedback: {
    question_description: string;
    overall: number | null;
    mentor_value: number | null;
    self_value: number | null;
    feedback_count: number;
    comment_count: number;
  };
  onViewComments: () => void;
  children?: React.ReactNode;
};

export function FeedbackCard({ feedback, onViewComments, children }: FeedbackCardProps) {
  return (
    <div className="bg-white rounded-[20px] p-6 mb-4">
      {/* Question and Rating */}
      <div className="mb-8">
        <p className="text-lg mb-6">{feedback.question_description}</p>
        <div className="flex justify-center gap-4 px-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <div key={star} className="flex flex-col items-center">
              <div className={`w-12 h-12 ${
                feedback.overall && star <= feedback.overall 
                  ? 'text-yellow-400' 
                  : 'text-gray-200'
              }`}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="py-4 px-2">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Overall:</span>
            <span className="text-lg font-semibold">
              {feedback.overall ? feedback.overall.toFixed(1) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Mentor:</span>
            <span className="text-lg">
              {feedback.mentor_value ? feedback.mentor_value.toFixed(1) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Self:</span>
            <span className="text-lg">
              {feedback.self_value ? feedback.self_value.toFixed(1) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">N. Feedback:</span>
            <span className="text-lg">
              {feedback.feedback_count}
            </span>
          </div>
        </div>
      </div>

      {/* Initiatives Section */}
      {children}

      {/* Comments Link - Show only if there are comments */}
      {feedback.comment_count > 0 && (
        <div 
          className="mt-6 flex justify-between items-center cursor-pointer hover:opacity-80"
          onClick={onViewComments}
        >
          <h3 className="text-lg font-semibold">
            {feedback.comment_count === 1 
              ? "Visualizza 1 commento" 
              : `Visualizza ${feedback.comment_count} commenti`}
          </h3>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
} 