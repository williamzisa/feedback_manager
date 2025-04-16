"use client";

interface FeedbackScoreCardProps {
  overall: number;
  self: number;
  mentor: number;
  commentCount: number;
  sessionId: string;
  userId: string;
  questionId: string;
}

export function FeedbackScoreCard({
  overall,
  self,
  mentor,
  commentCount,
  sessionId,
  userId,
  questionId,
}: FeedbackScoreCardProps) {
  return (
    <div className="space-y-4 mt-8">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <span className="text-lg font-semibold">
            Overall: {overall.toFixed(1)}/5
          </span>
        </div>
        <div className="text-center">
          <span className="text-lg">Mentor: {mentor.toFixed(1)}/5</span>
        </div>
        <div className="text-center">
          <span className="text-lg">Self: {self.toFixed(1)}/5</span>
        </div>
      </div>
      {commentCount > 0 ? (
        <a
          href={`/session_results/comment?sessionId=${sessionId}&userId=${userId}&questionId=${questionId}`}
          className="block text-center py-3 border-t border-gray-100 group cursor-pointer"
        >
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-semibold">
              Hai ricevuto {commentCount}{" "}
              {commentCount === 1 ? "commento" : "commenti"}, guardali qui:
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-gray-100">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </a>
      ) : (
        <div className="text-center py-3 border-t border-gray-100 text-sm text-gray-500">
          Nessun commento ricevuto
        </div>
      )}
    </div>
  );
}
