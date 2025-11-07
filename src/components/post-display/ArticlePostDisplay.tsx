"use client";

import Image from "next/image";
import FormattedPostContent from "../feed/FormattedPostContent";

interface ArticlePostDisplayProps {
  title: string;
  coverImage?: string | null;
  readingTime?: number | null;
  content: string;
  onReadMore?: () => void;
}

const ArticlePostDisplay = ({ 
  title, 
  coverImage, 
  readingTime, 
  content,
  onReadMore 
}: ArticlePostDisplayProps) => {
  const truncatedContent = content.length > 200 ? content.substring(0, 200) + "..." : content;
  const shouldShowReadMore = content.length > 200;

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        {readingTime && (
          <p className="text-sm text-gray-500 mb-3">{readingTime} min read</p>
        )}
        <div className="text-gray-700 leading-relaxed">
          <FormattedPostContent content={truncatedContent} />
        </div>
        {shouldShowReadMore && (
          <button
            onClick={onReadMore}
            className="mt-3 text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            Read more →
          </button>
        )}
      </div>
    </div>
  );
};

export default ArticlePostDisplay;
