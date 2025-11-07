"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import EmojiPicker from "./EmojiPicker";
import MentionDropdown from "./MentionDropdown";
import HashtagDropdown from "./HashtagDropdown";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  showToolbar?: boolean;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "What's on your mind?",
  minHeight = "100px",
  showToolbar = true,
}: RichTextEditorProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [showHashtags, setShowHashtags] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [hashtagSearch, setHashtagSearch] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + text + value.substring(start);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const wrapSelectedText = (before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    if (selectedText) {
      const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
      onChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
      }, 0);
    } else {
      const newText = value.substring(0, start) + before + after + value.substring(start);
      onChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length);
      }, 0);
    }
  };

  const handleFormat = (format: string) => {
    if (format === 'bold') wrapSelectedText('**', '**');
    else if (format === 'italic') wrapSelectedText('*', '*');
    else if (format === 'underline') wrapSelectedText('<u>', '</u>');
    else if (format === 'bulletList') insertAtCursor('\n• ');
    else if (format === 'numberList') insertAtCursor('\n1. ');
  };

  const insertEmoji = (emoji: string) => {
    insertAtCursor(emoji);
    setShowEmojiPicker(false);
  };

  const insertLink = () => {
    if (linkUrl) {
      const linkMarkdown = `[${linkText || linkUrl}](${linkUrl})`;
      insertAtCursor(linkMarkdown);
      setLinkUrl("");
      setLinkText("");
      setShowLinkInput(false);
    }
  };

  const insertMention = (username: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    const lastAtIndex = beforeCursor.lastIndexOf("@");
    const newValue = beforeCursor.substring(0, lastAtIndex) + `@${username} ` + afterCursor;
    onChange(newValue);
    setShowMentions(false);
    setMentionSearch("");
    setTimeout(() => {
      textarea.focus();
      const newPos = lastAtIndex + username.length + 2;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const insertHashtag = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    const lastHashIndex = beforeCursor.lastIndexOf("#");
    const newValue = beforeCursor.substring(0, lastHashIndex) + `#${tag} ` + afterCursor;
    onChange(newValue);
    setShowHashtags(false);
    setHashtagSearch("");
    setTimeout(() => {
      textarea.focus();
      const newPos = lastHashIndex + tag.length + 2;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    onChange(newValue);
    const beforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = beforeCursor.lastIndexOf("@");
    const textAfterAt = beforeCursor.substring(lastAtIndex + 1);
    const hasSpaceAfterAt = textAfterAt.includes(" ");
    if (lastAtIndex !== -1 && !hasSpaceAfterAt && lastAtIndex > beforeCursor.lastIndexOf(" ")) {
      setMentionSearch(textAfterAt);
      setShowMentions(true);
      setShowHashtags(false);
    } else {
      const lastHashIndex = beforeCursor.lastIndexOf("#");
      const textAfterHash = beforeCursor.substring(lastHashIndex + 1);
      const hasSpaceAfterHash = textAfterHash.includes(" ");
      if (lastHashIndex !== -1 && !hasSpaceAfterHash && lastHashIndex > beforeCursor.lastIndexOf(" ")) {
        setHashtagSearch(textAfterHash);
        setShowHashtags(true);
        setShowMentions(false);
      } else {
        setShowMentions(false);
        setShowHashtags(false);
      }
    }
  };

  return (
    <div className="relative w-full">
      {showToolbar && (
        <div className="flex items-center gap-1 md:gap-2 p-1.5 md:p-2 border-b border-gray-200 flex-wrap bg-gray-50 rounded-t-lg overflow-x-auto scrollbar-hide">
          <button type="button" onClick={() => handleFormat("bold")} className="px-2 md:px-3 py-1 md:py-1.5 hover:bg-gray-200 rounded font-bold text-xs md:text-sm" title="Bold">B</button>
          <button type="button" onClick={() => handleFormat("italic")} className="px-2 md:px-3 py-1 md:py-1.5 hover:bg-gray-200 rounded italic text-xs md:text-sm" title="Italic">I</button>
          <button type="button" onClick={() => handleFormat("underline")} className="px-2 md:px-3 py-1 md:py-1.5 hover:bg-gray-200 rounded underline text-xs md:text-sm" title="Underline">U</button>
          <div className="w-px h-4 md:h-6 bg-gray-300"></div>
          <button type="button" onClick={() => handleFormat("bulletList")} className="px-2 md:px-3 py-1 md:py-1.5 hover:bg-gray-200 rounded text-xs md:text-sm whitespace-nowrap">• List</button>
          <button type="button" onClick={() => handleFormat("numberList")} className="px-2 md:px-3 py-1 md:py-1.5 hover:bg-gray-200 rounded text-xs md:text-sm whitespace-nowrap">1. List</button>
          <div className="w-px h-4 md:h-6 bg-gray-300"></div>
          <button type="button" onClick={() => setShowLinkInput(!showLinkInput)} className="p-1.5 md:p-2 hover:bg-gray-200 rounded"><Image src="/link.png" alt="Link" width={14} height={14} className="md:w-4 md:h-4" /></button>
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 md:p-2 hover:bg-gray-200 rounded"><Image src="/emoji.png" alt="Emoji" width={14} height={14} className="md:w-4 md:h-4" /></button>
          <button type="button" onClick={() => insertAtCursor("@")} className="px-2 md:px-3 py-1 md:py-1.5 hover:bg-gray-200 rounded text-xs md:text-sm font-semibold">@</button>
          <button type="button" onClick={() => insertAtCursor("#")} className="px-2 md:px-3 py-1 md:py-1.5 hover:bg-gray-200 rounded text-xs md:text-sm font-semibold">#</button>
        </div>
      )}
      {showLinkInput && (
        <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-300 rounded-lg shadow-lg p-3 md:p-4 mt-1">
          <div className="space-y-2">
            <input type="url" placeholder="Enter URL" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base" />
            <input type="text" placeholder="Link text (optional)" value={linkText} onChange={(e) => setLinkText(e.target.value)} className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base" />
            <div className="flex gap-2">
              <button type="button" onClick={insertLink} className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base">Insert</button>
              <button type="button" onClick={() => setShowLinkInput(false)} className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm md:text-base">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <textarea ref={textareaRef} value={value} onChange={handleTextChange} placeholder={placeholder} className="w-full p-2 md:p-3 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm md:text-base" style={{ minHeight }} />
      {showEmojiPicker && <div className="absolute z-20 mt-1"><EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmojiPicker(false)} /></div>}
      {showMentions && <MentionDropdown searchTerm={mentionSearch} onSelect={insertMention} onClose={() => setShowMentions(false)} />}
      {showHashtags && <HashtagDropdown searchTerm={hashtagSearch} onSelect={insertHashtag} onClose={() => setShowHashtags(false)} />}
      <div className="text-right text-xs text-gray-500 mt-1">{value.length} / 3000 characters</div>
    </div>
  );
};

export default RichTextEditor;