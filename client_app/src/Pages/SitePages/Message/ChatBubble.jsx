// src/components/ChatBubble.js
import React from "react";
import { FaUserCircle, FaUserShield } from "react-icons/fa";
import { format } from "date-fns"; // Import date-fns for formatting dates

const formatTimestamp = (timestamp) => {
  if (timestamp && timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return format(date, 'yyyy-MM-dd HH:mm:ss'); // Customize this format as needed
  }
  return null; // Handle null or undefined timestamps appropriately
};

const ChatBubble = ({ message, isAdmin }) => {
  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`flex items-center space-x-2 ${isAdmin ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
          } p-3 rounded-lg max-w-xs`}
      >
        {isAdmin ? (
          <FaUserShield className="text-white" />
        ) : (
          <FaUserCircle className="text-gray-700" />
        )}
        <div>
          <p>{message.text}</p>
          {/* Moved the timestamp below the message text */}
          <p className="text-xs text-white-600">{formatTimestamp(message.timestamp)}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
