"use client";
import { useState, useEffect, useRef } from "react";

export default function NotificationBell({ currentUser, getToken }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:3500/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);

        // Calculate unread count
        const unread = data.filter((notification) => !notification.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notifications as read
  const markAsRead = async (notificationIds) => {
    if (!currentUser || notificationIds.length === 0) return;

    try {
      const token = await getToken();
      await fetch("http://localhost:3500/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationIds }),
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notificationIds.includes(notif.id) ? { ...notif, read: true } : notif
        )
      );

      // Recalculate unread count
      setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  // Handle bell click
  const handleBellClick = async () => {
    setIsOpen(!isOpen);

    if (!isOpen) {
      // Opening the bell - fetch latest notifications
      await fetchNotifications();

      // Mark all unread notifications as read when bell is opened
      const unreadNotificationIds = notifications
        .filter((notif) => !notif.read)
        .map((notif) => notif.id);

      if (unreadNotificationIds.length > 0) {
        await markAsRead(unreadNotificationIds);
      }
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  // Format due date display
  const formatDueDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  // Get urgency icon based on days until due
  const getUrgencyIcon = (daysUntilDue) => {
    if (daysUntilDue < 0) return "🚨";
    if (daysUntilDue === 0) return "⏰";
    if (daysUntilDue === 1) return "⚡";
    return "📅";
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
        title="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-3.5-3.5v-5A6.5 6.5 0 108 3v8.5L4.5 15H10m5 2v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Red notification bubble */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="roboto-condensed-custom text-lg font-semibold text-white">
              Notifications
            </h3>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-400 roboto-condensed-custom">
                  Loading notifications...
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-400 roboto-condensed-custom">
                  No notifications
                </div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                    !notification.read ? "bg-gray-700" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      {getUrgencyIcon(notification.daysUntilDue)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="roboto-condensed-custom font-medium text-white truncate">
                          {notification.taskTitle}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                            notification.priority
                          )}`}
                        >
                          {notification.priority?.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-sm text-gray-300 roboto-condensed-custom">
                        due {formatDueDate(notification.dueDate)}
                      </div>
                    </div>

                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-700 text-center">
              <button
                onClick={() => {
                  fetchNotifications();
                }}
                className="text-blue-400 hover:text-blue-300 text-sm roboto-condensed-custom cursor-pointer"
              >
                Refresh notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
