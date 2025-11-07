"use client";

import Link from "next/link";

interface FormattedPostContentProps {
  content: string;
  richContent?: any;
}

const FormattedPostContent = ({ content, richContent }: FormattedPostContentProps) => {
  // Function to parse and format the content
  const parseContent = (text: string) => {
    if (!text) return null;

    // Split by newlines first to preserve line breaks
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      const parts: JSX.Element[] = [];
      
      // Regular expressions for different patterns (order matters!)
      const patterns = [
        // Markdown links: [text](url) - FIRST
        { 
          regex: /\[(.+?)\]\((.+?)\)/g, 
          type: 'link',
          component: (text: string, key: number, url?: string) => 
            <a key={key} href={url || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {text}
            </a> 
        },
        // Auto-detect URLs (http://, https://, www., .com, .in, etc.)
        { 
          regex: /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g,
          type: 'url',
          component: (url: string, key: number, _?: string) => {
            const fullUrl = url.startsWith('http') ? url : `https://${url}`;
            return (
              <a key={key} href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {url}
              </a>
            );
          }
        },
        // Bold: **text**
        { 
          regex: /\*\*(.+?)\*\*/g,
          type: 'bold',
          component: (match: string, key: number, _?: string) => 
            <strong key={key} className="font-bold">{match}</strong> 
        },
        // Italic: *text*
        { 
          regex: /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g,
          type: 'italic',
          component: (match: string, key: number, _?: string) => 
            <em key={key} className="italic">{match}</em> 
        },
        // Underline: <u>text</u>
        { 
          regex: /<u>(.+?)<\/u>/g,
          type: 'underline',
          component: (match: string, key: number, _?: string) => 
            <u key={key} className="underline">{match}</u> 
        },
        // Mentions: @username
        { 
          regex: /@(\w+)/g,
          type: 'mention',
          component: (match: string, key: number, _?: string) => 
            <Link key={key} href={`/profile/${match}`} className="text-blue-600 hover:underline font-medium">
              @{match}
            </Link> 
        },
        // Hashtags: #tag
        { 
          regex: /#(\w+)/g,
          type: 'hashtag',
          component: (match: string, key: number, _?: string) => 
            <span key={key} className="text-blue-600 hover:underline cursor-pointer font-medium">
              #{match}
            </span> 
        },
      ];

      // Find all matches with their positions
      const allMatches: Array<{
        index: number;
        length: number;
        element: JSX.Element;
        type: string;
      }> = [];

      patterns.forEach((pattern) => {
        const regex = new RegExp(pattern.regex);
        let match;
        
        while ((match = regex.exec(line)) !== null) {
          const fullMatch = match[0];
          const innerText = match[1];
          const secondCapture = match[2];
          
          let element: JSX.Element;
          
          // Handle different pattern types
          if (pattern.type === 'link') {
            element = pattern.component(innerText, match.index, secondCapture);
          } else {
            element = pattern.component(pattern.type === 'url' ? fullMatch : innerText, match.index);
          }
          
          allMatches.push({
            index: match.index,
            length: fullMatch.length,
            element: element,
            type: pattern.type,
          });
        }
      });

      // Remove overlapping matches (keep the first one)
      const filteredMatches = allMatches
        .sort((a, b) => a.index - b.index)
        .filter((match, idx, arr) => {
          if (idx === 0) return true;
          const prevMatch = arr[idx - 1];
          return match.index >= prevMatch.index + prevMatch.length;
        });

      // Build the final parts array
      let lastIndex = 0;
      filteredMatches.forEach((match, idx) => {
        // Add text before the match
        if (match.index > lastIndex) {
          parts.push(
            <span key={`text-${lineIndex}-${idx}`}>
              {line.substring(lastIndex, match.index)}
            </span>
          );
        }
        
        // Add the matched element
        parts.push(match.element);
        lastIndex = match.index + match.length;
      });

      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(
          <span key={`text-${lineIndex}-end`}>
            {line.substring(lastIndex)}
          </span>
        );
      }

      // If no matches found, return the original line
      if (parts.length === 0) {
        return <span key={`line-${lineIndex}`}>{line}</span>;
      }

      return (
        <span key={`line-${lineIndex}`}>
          {parts}
        </span>
      );
    }).reduce((acc: JSX.Element[], curr, idx) => {
      // Add line breaks between lines
      if (idx > 0) {
        acc.push(<br key={`br-${idx}`} />);
      }
      acc.push(curr);
      return acc;
    }, []);
  };

  return (
    <div className="post-content whitespace-pre-wrap break-words">
      {parseContent(content)}
    </div>
  );
};

export default FormattedPostContent;
