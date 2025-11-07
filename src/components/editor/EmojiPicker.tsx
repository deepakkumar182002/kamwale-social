"use client";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const emojis = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂",
  "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋",
  "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳",
  "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖",
  "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯",
  "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔",
  "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉",
  "👆", "👇", "☝️", "✋", "🤚", "🖐", "🖖", "👋", "🤝", "🙏",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
  "❤️‍🔥", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🎉", "🎊",
  "🎁", "🎈", "🎂", "🎀", "🏆", "🥇", "🥈", "🥉", "⚽", "🏀",
  "🔥", "⭐", "✨", "💫", "🌟", "💥", "💯", "✅", "❌", "⚠️"
];

const EmojiPicker = ({ onSelect, onClose }: EmojiPickerProps) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Choose Emoji</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(emoji)}
            className="text-xl hover:bg-gray-100 rounded p-1 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
