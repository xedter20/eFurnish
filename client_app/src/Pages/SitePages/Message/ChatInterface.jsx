// src/components/ChatInterface.js
import React, { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, writeBatch, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebase.config";
import ChatBubble from "./ChatBubble";
import { debugErrorMap } from "firebase/auth";


const ChatInterface = ({ selectedUserId, currentUserId, selectedUserName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");


  const containerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    if (scrollHeight <= clientHeight) {
      setIsAtBottom(true); // Content fits without scrolling
    } else {
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        setIsAtBottom(true); // Scrolled to the bottom
      } else {
        setIsAtBottom(false);
      }
    }
  };


  useEffect(() => {
    // Check on mount or when content changes
    const { scrollHeight, clientHeight } = containerRef.current;

    if (scrollHeight <= clientHeight) {
      setIsAtBottom(true);
    } else {
      setIsAtBottom(false);
    }
  }, [containerRef.current?.scrollHeight]);

  useEffect(() => {

    if (isAtBottom) {
      const chatPath2 = `${currentUserId}++${selectedUserId}`;
      const q2 = query(
        collection(db, 'chats', chatPath2, 'messages'),
        orderBy('timestamp')
      );
      const fetchAndMarkMessagesAsRead = async (q2) => {
        try {
          const snapshot = await getDocs(q2); // Fetch messages matching the query

          if (!snapshot.empty) {
            console.log("Fetching messages and marking them as read...");

            const batch = writeBatch(db); // Initialize Firestore batch

            snapshot.docs.forEach((doc) => {
              const messageRef = doc.ref; // Reference to the message document
              batch.update(messageRef, { is_read: true }); // Mark as read
            });

            // Commit the batch to apply updates
            await batch.commit();
            console.log("All messages marked as read.");
          } else {
            console.log("No messages to mark as read.");
          }
        } catch (error) {
          console.error("Error fetching or updating messages:", error);
        }
      };

      // Example Usage
      fetchAndMarkMessagesAsRead(q2);

    }


  }, [currentUserId, isAtBottom, selectedUserId]);



  useEffect(() => {
    if (!selectedUserId || !currentUserId) return; // Prevent running if IDs are not set
    setMessages([])
    // Construct both possible chat paths
    const chatPath1 = `${selectedUserId}++${currentUserId}`;
    const chatPath2 = `${currentUserId}++${selectedUserId}`;
    console.log("jhamssss")

    // Create the Firestore queries for both paths
    const q1 = query(
      collection(db, 'chats', chatPath1, 'messages'),
      orderBy('timestamp')
    );

    const q2 = query(
      collection(db, 'chats', chatPath2, 'messages'),
      orderBy('timestamp')
    );

    // Subscribe to Firestore updates for both queries
    const unsubscribe1 = onSnapshot(q1, (snapshot) => {
      const filteredMessages = snapshot.docs;
      setMessages((prevMessages) => [
        ...prevMessages,
        ...filteredMessages.map((doc) => ({ id: doc.id, ...doc.data() }))
      ]);
    });

    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      const filteredMessages = snapshot.docs;


      setMessages((prevMessages) => [
        ...prevMessages,
        ...filteredMessages.map((doc) => ({ id: doc.id, ...doc.data() }))
      ]);




    });

    // Cleanup subscriptions on component unmount
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [selectedUserId, currentUserId]); // Re-run when IDs or prefix change

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;
    await addDoc(collection(db, "chats", `${selectedUserId}++${currentUserId}`, "messages"), {
      text: newMessage,
      userId: currentUserId,
      senderId: currentUserId,
      receiverId: selectedUserId,
      timestamp: serverTimestamp(),
      isRead: false,
    });
    setNewMessage("");
  };

  const uniqueMessages = Array.from(new Map(messages.map(item => [item.id, item])).values()).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));



  return (

    <div className="flex-1 p-4 flex flex-col" >
      {/* Display selected user name */}
      <h2 className="text-xl font-bold mb-2">{selectedUserName}</h2>
      <div className="flex-1 space-y-2 overflow-y-auto" ref={containerRef} onScroll={handleScroll}>
        {uniqueMessages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            isAdmin={message.userId === currentUserId}
          />
        ))}
      </div>
      <div className="flex mt-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded p-2 py-4"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
