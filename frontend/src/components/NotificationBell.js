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
          fill="currentColor"
          viewBox="0 0 90 90"
        >
          <path d="M 83.25 74.548 H 6.75 c -1.536 0 -2.864 -0.988 -3.306 -2.457 c -0.441 -1.468 0.122 -3.022 1.401 -3.868 c 0.896 -0.594 1.954 -1.152 3.233 -1.707 c 5.52 -2.514 6.42 -16.025 7.144 -26.882 c 0.182 -2.74 0.355 -5.327 0.59 -7.664 c 1.926 -12.752 8.052 -20.942 18.223 -24.424 C 35.767 3.067 40.169 0 45 0 s 9.233 3.067 10.964 7.546 c 10.171 3.482 16.298 11.671 18.214 24.352 c 0.245 2.409 0.416 4.996 0.6 7.736 c 0.723 10.857 1.624 24.368 7.168 26.893 c 1.255 0.544 2.313 1.102 3.21 1.696 c 1.279 0.846 1.842 2.4 1.4 3.868 C 86.114 73.56 84.785 74.548 83.25 74.548 z M 45 2.934 c -3.818 0 -7.279 2.556 -8.416 6.215 l -0.228 0.733 l -0.732 0.231 c -9.568 3.018 -15.096 10.287 -16.9 22.224 c -0.221 2.216 -0.392 4.779 -0.573 7.493 c -0.816 12.242 -1.74 26.117 -8.88 29.368 c -1.129 0.49 -2.064 0.982 -2.806 1.473 c -0.265 0.175 -0.26 0.409 -0.21 0.575 c 0.051 0.168 0.177 0.368 0.496 0.368 h 76.5 c 0.318 0 0.445 -0.2 0.496 -0.368 c 0.05 -0.166 0.054 -0.4 -0.209 -0.575 h -0.001 c -0.741 -0.491 -1.677 -0.983 -2.782 -1.462 c -7.163 -3.261 -8.088 -17.137 -8.905 -29.379 c -0.181 -2.714 -0.352 -5.277 -0.582 -7.565 c -1.795 -11.864 -7.323 -19.134 -16.891 -22.151 l -0.732 -0.231 L 53.416 9.15 C 52.279 5.49 48.818 2.934 45 2.934 z"/>
          <path d="M 33.257 78.292 C 33.277 84.75 38.536 90 45 90 c 6.463 0 11.723 -5.25 11.743 -11.708 H 33.257 z M 45 87.066 c -3.816 0 -7.063 -2.443 -8.285 -5.843 h 16.57 C 52.063 84.623 48.816 87.066 45 87.066 z"/>
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
