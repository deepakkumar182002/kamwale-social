"use client";

import Image from "next/image";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import FormattedPostContent from "../feed/FormattedPostContent";

interface EventPostDisplayProps {
  postId: string;
  title: string;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  eventType?: string | null;
  coverImage?: string | null;
  rsvps?: string[];
  description?: string;
}

const EventPostDisplay = ({ 
  postId,
  title, 
  startDate,
  endDate,
  location, 
  eventType = "physical",
  coverImage,
  rsvps = [],
  description
}: EventPostDisplayProps) => {
  const { user } = useUser();
  const [hasRSVPd, setHasRSVPd] = useState(rsvps.includes(user?.id || ""));
  const [rsvpCount, setRsvpCount] = useState(rsvps.length);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRSVP = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/posts/${postId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setHasRSVPd(!hasRSVPd);
        setRsvpCount(hasRSVPd ? rsvpCount - 1 : rsvpCount + 1);
      }
    } catch (error) {
      console.error("Error RSVP:", error);
    }
  };

  const getEventTypeIcon = () => {
    switch(eventType) {
      case "virtual": return "💻";
      case "hybrid": return "🌐";
      default: return "📍";
    }
  };

  return (
    <div className="border-t border-gray-200">
      {coverImage && (
        <div className="relative w-full h-64">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-16 text-center bg-red-500 text-white rounded-lg p-2">
            <div className="text-xs font-semibold">
              {new Date(startDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
            </div>
            <div className="text-2xl font-bold">
              {new Date(startDate).getDate()}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>🕒</span>
                <span>{formatDate(startDate)}</span>
              </div>
              {endDate && (
                <div className="flex items-center gap-2">
                  <span>→</span>
                  <span>{formatDate(endDate)}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2">
                  <span>{getEventTypeIcon()}</span>
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {description && (
          <div className="mb-4 text-gray-700 text-sm">
            <FormattedPostContent content={description} />
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleRSVP}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
              hasRSVPd
                ? "bg-green-50 text-green-600 border-2 border-green-600"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {hasRSVPd ? "✓ Going" : "RSVP"}
          </button>
          <div className="text-sm text-gray-600">
            {rsvpCount} {rsvpCount === 1 ? "person" : "people"} going
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPostDisplay;
