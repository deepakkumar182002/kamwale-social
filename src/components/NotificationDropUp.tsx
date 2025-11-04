"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  content: string;
  postId?: string;
  chatId?: string;
  fromUser: {
    id: string;
    username: string;
    avatar: string | null;
    name: string | null;
    surname: string | null;
  };
  post?: {
    id: string;
    img: string;
  };
  createdAt: string;
  read: boolean;
}

interface NotificationDropUpProps {
  onNotificationClick: (notification: Notification) => void;
  onClose: () => void;
}

const NotificationDropUp = ({ onNotificationClick, onClose }: NotificationDropUpProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        const validNotifications = data.filter((n: Notification) => n.fromUser && n.fromUser.username);
        setNotifications(validNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post.';
      case 'comment':
        return 'commented on your post.';
      case 'share':
        return 'shared your post.';
      case 'follow':
        return 'started following you.';
      case 'followRequest':
        return 'requested to follow you.';
      case 'message':
        return 'sent you a message.';
      default:
        return notification.content;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notifDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return `${Math.floor(diffInMinutes / 10080)}w`;
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="h-full">
      {loading ? (
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p>No notifications yet</p>
        </div>
      ) : (
        <div>
          {notifications.slice(0, 20).map(notification => (
            <button
              key={notification.id}
              onClick={() => {
                markAsRead(notification.id);
                onNotificationClick(notification);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 relative ${
                !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
              }`}
            >
              {!notification.read && (
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
              <div className="relative flex-shrink-0 ml-3">
                <Image
                  src={notification.fromUser.avatar || '/noAvatar.png'}
                  alt={notification.fromUser.username}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm dark:text-white">
                  <span className="font-semibold">{notification.fromUser.username}</span>
                  {' '}
                  <span className="text-gray-700 dark:text-gray-300">{getNotificationText(notification)}</span>
                </p>
                <span className="text-xs text-gray-400 dark:text-gray-500">{getTimeAgo(notification.createdAt)}</span>
              </div>
              {notification.post?.img && (
                <Image
                  src={notification.post.img}
                  alt="Post"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-cover rounded flex-shrink-0"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationDropUp;
