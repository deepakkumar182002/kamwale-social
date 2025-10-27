"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Notification {
  id: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
  chatId: string | null;
  fromUser: {
    id: string;
    username: string;
    avatar: string | null;
    name: string | null;
    surname: string | null;
  } | null;
}

interface NotificationIconProps {
  onOpenChat?: (userId: string) => void;
}

const NotificationIcon = ({ onOpenChat }: NotificationIconProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true }))
        );
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // If it's a message notification and has a fromUser, open chat with that user
    if (notification.type === "message" && notification.fromUser && onOpenChat) {
      onOpenChat(notification.fromUser.id);
      setShowDropdown(false); // Close dropdown after clicking
    }
    // For other notification types (like follow, like, comment), you can add more logic here
    // For example, redirect to the relevant post or profile
  };

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && unreadCount > 0) {
      // Mark as read when opening dropdown
      markAllAsRead();
    }
  };

  return (
    <div className="relative">
      <div
        className="cursor-pointer relative"
        onClick={handleToggleDropdown}
      >
        <Image
          src="/notifications.png"
          alt="Notifications"
          width={20}
          height={20}
        />
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </div>

      {showDropdown && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg w-80 max-h-96 overflow-y-auto z-50">
          <div className="p-3 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-50 hover:bg-gray-100 cursor-pointer transition-colors ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <Image
                      src={notification.fromUser?.avatar || "/noAvatar.png"}
                      alt={notification.fromUser?.username || "User"}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">
                          {notification.fromUser?.name || notification.fromUser?.username || "Someone"}
                        </span>{" "}
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
