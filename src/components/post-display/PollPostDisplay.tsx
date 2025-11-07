"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import FormattedPostContent from "../feed/FormattedPostContent";

interface PollPostDisplayProps {
  postId: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  endsAt?: string | null;
  allowMultiple?: boolean;
  showResults?: boolean;
}

const PollPostDisplay = ({ 
  postId,
  question, 
  options, 
  votes = {},
  endsAt,
  allowMultiple = false,
  showResults = true 
}: PollPostDisplayProps) => {
  const { user } = useUser();
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVotedOption, setUserVotedOption] = useState<number | null>(null);
  const [currentVotes, setCurrentVotes] = useState(votes);
  const [isExpired, setIsExpired] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (endsAt) {
      const now = new Date();
      const endDate = new Date(endsAt);
      setIsExpired(now > endDate);
    }

    // Check if user has already voted
    if (user && currentVotes[user.id] !== undefined) {
      setHasVoted(true);
      setUserVotedOption(currentVotes[user.id]);
      setSelectedOptions([currentVotes[user.id]]);
    }
  }, [endsAt, user, currentVotes]);

  const totalVotes = Object.keys(currentVotes).length;

  const getVotePercentage = (optionIndex: number) => {
    if (totalVotes === 0) return 0;
    const optionVotes = Object.values(currentVotes).filter(v => v === optionIndex).length;
    return Math.round((optionVotes / totalVotes) * 100);
  };

  const getVoteCount = (optionIndex: number) => {
    return Object.values(currentVotes).filter(v => v === optionIndex).length;
  };

  const handleVote = async (optionIndex: number) => {
    if (!user || isExpired || isVoting) return;

    setIsVoting(true);

    // If user already voted for this option, unvote
    if (hasVoted && userVotedOption === optionIndex) {
      try {
        const response = await fetch(`/api/posts/${postId}/vote`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const newVotes = { ...currentVotes };
          delete newVotes[user.id];
          setCurrentVotes(newVotes);
          setHasVoted(false);
          setUserVotedOption(null);
          setSelectedOptions([]);
        }
      } catch (error) {
        console.error("Error unvoting:", error);
      }
    } else {
      // Vote or change vote
      try {
        const response = await fetch(`/api/posts/${postId}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optionIndex }),
        });

        if (response.ok) {
          const newVotes = { ...currentVotes, [user.id]: optionIndex };
          setCurrentVotes(newVotes);
          setHasVoted(true);
          setUserVotedOption(optionIndex);
          setSelectedOptions([optionIndex]);
        }
      } catch (error) {
        console.error("Error voting:", error);
      }
    }

    setIsVoting(false);
  };

  const showResultsView = hasVoted || isExpired || (showResults && totalVotes > 0);

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📊</span>
        <h3 className="font-semibold text-gray-900">Poll</h3>
        {isExpired && <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">Ended</span>}
      </div>

      {/* Poll Question with Formatting */}
      <div className="mb-4">
        <FormattedPostContent content={question} />
      </div>

      <div className="space-y-3">
        {options.map((option, index) => {
          const percentage = getVotePercentage(index);
          const voteCount = getVoteCount(index);
          const isUserVoted = userVotedOption === index;

          return (
            <div key={index}>
              <button
                onClick={() => handleVote(index)}
                disabled={isExpired || isVoting}
                className={`w-full text-left p-3 border-2 rounded-lg transition-all relative overflow-hidden ${
                  isUserVoted
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                } ${isExpired ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {/* Progress bar background */}
                {totalVotes > 0 && (
                  <div 
                    className="absolute inset-0 bg-blue-100 transition-all duration-300"
                    style={{ width: `${percentage}%`, opacity: 0.3 }}
                  />
                )}
                
                {/* Content */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isUserVoted ? "border-blue-600 bg-blue-600" : "border-gray-300"
                    }`}>
                      {isUserVoted && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{option}</span>
                  </div>
                  
                  {totalVotes > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{voteCount} {voteCount === 1 ? 'vote' : 'votes'}</span>
                      <span className="font-bold text-blue-600">{percentage}%</span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Poll Stats */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          {endsAt && !isExpired && (
            <span className="ml-2">• Ends {new Date(endsAt).toLocaleDateString()}</span>
          )}
        </span>
        {hasVoted && !isExpired && (
          <button
            onClick={() => userVotedOption !== null && handleVote(userVotedOption)}
            className="text-blue-600 hover:text-blue-700 font-medium"
            disabled={isVoting}
          >
            {isVoting ? 'Removing...' : 'Remove my vote'}
          </button>
        )}
        {isExpired && (
          <span className="text-red-500 font-medium">Poll ended</span>
        )}
      </div>
    </div>
  );
};

export default PollPostDisplay;
