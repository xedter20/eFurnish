import React, { useState, useRef, useEffect } from 'react';
import { BsBell } from 'react-icons/bs';

const App = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState({});
  const [unreadMessageCount, setUnreadMessageCount] = useState(3); // Example unread count
  const notifications = [
    'New message from John',
    'Your order has been shipped and is on its way to you with an expected delivery date of next week.',
    'New comment on your post from Jane Doe, who said, "Great post! I loved it."'
  ]; // Example notifications

  const notificationRef = useRef(null);

  // Toggle the notification visibility when the bell icon is clicked
  const handleBellClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  // Toggle "See More" for each notification
  const handleSeeMoreClick = (index) => {
    setExpandedNotifications((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Close the notification dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      setIsNotificationOpen(false);
    }
  };

  // Add event listener on mount and clean up on unmount
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      {/* Bell icon */}
      <BsBell
        className="cursor-pointer text-2xl lg:text-[23px]"
        onClick={handleBellClick}
      />

      {/* Unread message count badge */}
      {unreadMessageCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {unreadMessageCount}
        </span>
      )}

      {/* Notifications dropdown */}
      {isNotificationOpen && (
        <div
          ref={notificationRef}
          className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-64 z-10"
        >
          <div className="p-2">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => {
                const isExpanded = expandedNotifications[index];
                const displayText = isExpanded
                  ? notification
                  : `${notification.slice(0, 50)}...`; // Truncate text to 50 characters

                return (
                  <div key={index} className="py-2 px-4 border-b text-sm text-gray-800">
                    <p>{displayText}</p>
                    {notification.length > 50 && !isExpanded && (
                      <button
                        className="text-blue-500 text-xs mt-1"
                        onClick={() => handleSeeMoreClick(index)}
                      >
                        See more
                      </button>
                    )}
                    {notification.length > 50 && isExpanded && (
                      <button
                        className="text-blue-500 text-xs mt-1"
                        onClick={() => handleSeeMoreClick(index)}
                      >
                        See less
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-2 px-4 text-sm text-gray-500">No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
