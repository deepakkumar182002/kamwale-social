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

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMessage?: (chatId: string) => void;
}

const NotificationPanel = ({ isOpen, onClose, onOpenMessage }: NotificationPanelProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        // Filter out notifications with null fromUser
        const validNotifications = data.filter((n: Notification) => n.fromUser && n.fromUser.username);
        setNotifications(validNotifications);
      } else {
        console.error('Failed to fetch notifications:', response.status);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
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

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle message notifications differently
    if (notification.type === 'message' && notification.chatId && onOpenMessage) {
      onOpenMessage(notification.chatId);
      return;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    // Don't return link for message notifications
    if (notification.type === 'message') {
      return '#';
    }

    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'share':
        // Redirect to the post - use postId or post.id
        const postId = notification.postId || notification.post?.id;
        return postId ? `/?postId=${postId}` : `/profile/${notification.fromUser.username}`;
      case 'follow':
      case 'followRequest':
        // Redirect to the user's profile
        return `/profile/${notification.fromUser.username}`;
      default:
        return `/profile/${notification.fromUser.username}`;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notifDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return `${Math.floor(diffInMinutes / 10080)}w`;
  };

  const groupNotificationsByDate = () => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const older: Notification[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    notifications.forEach(notif => {
      const notifDate = new Date(notif.createdAt);
      if (notifDate >= todayStart) {
        today.push(notif);
      } else if (notifDate >= yesterdayStart) {
        yesterday.push(notif);
      } else {
        older.push(notif);
      }
    });

    return { today, yesterday, older };
  };

  if (!isOpen) return null;

  const { today, yesterday, older } = groupNotificationsByDate();

  return (
    <>
      {/* Desktop Panel */}
      <div className="hidden lg:block fixed left-20 top-0 h-screen w-[400px] bg-white border-r border-gray-200 z-30 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      {/* Content */}
      <div className="pb-6">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">No notifications yet</p>
            <p className="text-sm mt-2">When someone likes or comments on your posts, you&apos;ll see it here.</p>
          </div>
        ) : (
          <>
            {/* Today */}
            {today.length > 0 && (
              <div className="mb-4">
                <h2 className="px-6 py-3 text-sm font-semibold text-gray-900">Today</h2>
                <div>
                  {today.map(notification => (
                    notification.type === 'message' ? (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="relative">
                          <Image
                            src={notification.fromUser.avatar || '/noAvatar.png'}
                            alt={notification.fromUser.username}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {!notification.read && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm">
                            <span className="font-semibold">{notification.fromUser.username}</span>
                            {' '}
                            <span className="text-gray-700">{getNotificationText(notification)}</span>
                            {' '}
                            <span className="text-gray-400">{getTimeAgo(notification.createdAt)}</span>
                          </p>
                        </div>
                      </button>
                    ) : (
                      <Link
                        key={notification.id}
                        href={getNotificationLink(notification)}
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="relative">
                          <Image
                            src={notification.fromUser.avatar || '/noAvatar.png'}
                            alt={notification.fromUser.username}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {!notification.read && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-semibold">{notification.fromUser.username}</span>
                            {' '}
                            <span className="text-gray-700">{getNotificationText(notification)}</span>
                            {' '}
                            <span className="text-gray-400">{getTimeAgo(notification.createdAt)}</span>
                          </p>
                        </div>
                        {notification.post?.img && (
                          <Image
                            src={notification.post.img}
                            alt="Post"
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover"
                          />
                        )}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Yesterday */}
            {yesterday.length > 0 && (
              <div className="mb-4">
                <h2 className="px-6 py-3 text-sm font-semibold text-gray-900">Yesterday</h2>
                <div>
                  {yesterday.map(notification => (
                    notification.type === 'message' ? (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="relative">
                          <Image
                            src={notification.fromUser.avatar || '/noAvatar.png'}
                            alt={notification.fromUser.username}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {!notification.read && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm">
                            <span className="font-semibold">{notification.fromUser.username}</span>
                            {' '}
                            <span className="text-gray-700">{getNotificationText(notification)}</span>
                            {' '}
                            <span className="text-gray-400">{getTimeAgo(notification.createdAt)}</span>
                          </p>
                        </div>
                      </button>
                    ) : (
                      <Link
                        key={notification.id}
                        href={getNotificationLink(notification)}
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="relative">
                          <Image
                            src={notification.fromUser.avatar || '/noAvatar.png'}
                            alt={notification.fromUser.username}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {!notification.read && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-semibold">{notification.fromUser.username}</span>
                            {' '}
                            <span className="text-gray-700">{getNotificationText(notification)}</span>
                            {' '}
                            <span className="text-gray-400">{getTimeAgo(notification.createdAt)}</span>
                          </p>
                        </div>
                        {notification.post?.img && (
                          <Image
                            src={notification.post.img}
                            alt="Post"
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover"
                          />
                        )}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Older */}
            {older.length > 0 && (
              <div>
                <h2 className="px-6 py-3 text-sm font-semibold text-gray-900">Earlier</h2>
                <div>
                  {older.map(notification => (
                    notification.type === 'message' ? (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="relative">
                          <Image
                            src={notification.fromUser.avatar || '/noAvatar.png'}
                            alt={notification.fromUser.username}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {!notification.read && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm">
                            <span className="font-semibold">{notification.fromUser.username}</span>
                            {' '}
                            <span className="text-gray-700">{getNotificationText(notification)}</span>
                            {' '}
                            <span className="text-gray-400">{getTimeAgo(notification.createdAt)}</span>
                          </p>
                        </div>
                      </button>
                    ) : (
                      <Link
                        key={notification.id}
                        href={getNotificationLink(notification)}
                        onClick={() => handleNotificationClick(notification)}
                        className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="relative">
                          <Image
                            src={notification.fromUser.avatar || '/noAvatar.png'}
                            alt={notification.fromUser.username}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {!notification.read && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-semibold">{notification.fromUser.username}</span>
                            {' '}
                            <span className="text-gray-700">{getNotificationText(notification)}</span>
                            {' '}
                            <span className="text-gray-400">{getTimeAgo(notification.createdAt)}</span>
                          </p>
                        </div>
                        {notification.post?.img && (
                          <Image
                            src={notification.post.img}
                            alt="Post"
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover"
                          />
                        )}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>

      {/* Mobile Full Screen Modal */}
      <div className="lg:hidden fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
        {/* Mobile Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-10 flex items-center justify-between">
          <h1 className="text-xl font-bold dark:text-white">Notifications</h1>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Content */}
        <div className="pb-20">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg">No notifications yet</p>
            </div>
          ) : (
            <>
              {today.length > 0 && (
                <div className="mb-4">
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Today</h3>
                  <div>
                    {today.map(notification => (
                      <Link
                        key={notification.id}
                        href={
                          notification.type === 'message' && notification.chatId && onOpenMessage
                            ? '#'
                            : getNotificationLink(notification)
                        }
                        onClick={(e) => {
                          if (notification.type === 'message' && notification.chatId && onOpenMessage) {
                            e.preventDefault();
                            onOpenMessage(notification.chatId);
                            markAsRead(notification.id);
                          } else {
                            markAsRead(notification.id);
                            onClose();
                          }
                        }}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        {!notification.read && (
                          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                        <div className="relative">
                          <Image
                            src={notification.fromUser.avatar || '/noAvatar.png'}
                            alt={notification.fromUser.username}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm dark:text-white">
                            <span className="font-semibold">{notification.fromUser.username}</span>
                            {' '}
                            <span className="text-gray-700 dark:text-gray-300">{getNotificationText(notification)}</span>
                            {' '}
                            <span className="text-gray-400 dark:text-gray-500">{getTimeAgo(notification.createdAt)}</span>
                          </p>
                        </div>
                        {notification.post?.img && (
                          <Image
                            src={notification.post.img}
                            alt="Post"
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {yesterday.length > 0 && (
                <div className="mb-4">
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Yesterday</h3>
                  <div>
                    {yesterday.map(notification => (
                      <Link
                        key={notification.id}
                        href={
                          notification.type === 'message' && notification.chatId && onOpenMessage
                            ? '#'
                            : getNotificationLink(notification)
                        }
                        onClick={(e) => {
                          if (notification.type === 'message' && notification.chatId && onOpenMessage) {
                            e.preventDefault();
                            onOpenMessage(notification.chatId);
                            markAsRead(notification.id);
                          } else {
                            markAsRead(notification.id);
                            onClose();
                          }
                        }}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        {!notification.read && (
                          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                        <div className="relative">
                          <Image
                            src={notification.fromUser.avatar || '/noAvatar.png'}
                            alt={notification.fromUser.username}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm dark:text-white">
                            <span className="font-semibold">{notification.fromUser.username}</span>
                            {' '}
                            <span className="text-gray-700 dark:text-gray-300">{getNotificationText(notification)}</span>
                            {' '}
                            <span className="text-gray-400 dark:text-gray-500">{getTimeAgo(notification.createdAt)}</span>
                          </p>
                        </div>
                        {notification.post?.img && (
                          <Image
                            src={notification.post.img}
                            alt="Post"
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {older.length > 0 && (
                <div>
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Older</h3>
                  <div>
                    {older.map(notification => (
                      <Link
                        key={notification.id}
                        href={
                          notification.type === 'message' && notification.chatId && onOpenMessage
                            ? '#'
                            : getNotificationLink(notification)
                        }
                        onClick={(e) => {
                          if (notification.type === 'message' && notification.chatId && onOpenMessage) {
                            e.preventDefault();
                            onOpenMessage(notification.chatId);
                            markAsRead(notification.id);
                          } else {
                            markAsRead(notification.id);
                            onClose();
                          }
                        }}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        {!notification.read && (
                          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                        <div className="relative">
                          <Image
                            src={notification.fromUser.avatar || '/noAvatar.png'}
                            alt={notification.fromUser.username}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm dark:text-white">
                            <span className="font-semibold">{notification.fromUser.username}</span>
                            {' '}
                            <span className="text-gray-700 dark:text-gray-300">{getNotificationText(notification)}</span>
                            {' '}
                            <span className="text-gray-400 dark:text-gray-500">{getTimeAgo(notification.createdAt)}</span>
                          </p>
                        </div>
                        {notification.post?.img && (
                          <Image
                            src={notification.post.img}
                            alt="Post"
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
