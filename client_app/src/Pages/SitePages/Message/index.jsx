// src/components/App.js
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatInterface from "./ChatInterface";
import axios from "axios";
import { getFirestore, collection, query, where, onSnapshot, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase.config";
import useAuth from "../../../hooks/useAuth";
import useAdmin from "../../../hooks/useAdmin";
import { set } from "date-fns";







const App = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { isAdmin, adminLoading } = useAdmin();
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const currentUserId = user?.uid;
  const [users, setUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [latestMessageTimestamps, setLatestMessageTimestamps] = useState({}); // Track latest timestamps


  const [activeUsers, setActiveUser] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/users/getAllUsers');
        const usersData = response.data;


        console.log({ usersData })
        const filteredUsers = isAdmin
          ? usersData
          : usersData.filter((u) => u.email === 'admin-efurnish@gmail.com');

        const usersRef = collection(db, "users");

        try {
          // Fetch all documents from the "users" collection
          const querySnapshot = await getDocs(usersRef);

          // Iterate through the documents and log the data
          // Convert querySnapshot to an array of user data
          const usersList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()  // Spread the document data into the object
          }));


          setActiveUser(usersList)



          // Set up Firestore listener for unread message counts and latest timestamps

          if (usersList.length > 0) {
            setupUnreadCountsListener(filteredUsers);
          }

          setIsLoaded(true);
          // let reduceUsers = filteredUsers.map((props) => {


          //   let data = usersList.find(u => u.email === props.email);
          //   return {
          //     ...props,
          //     is_online: true

          //   }


          // });

          // console.log({ reduceUsers })
          // setUsers(reduceUsers);


          // console.log({ usersList });  // This will log an array of user objects
        } catch (error) {
          console.error("Error getting users: ", error);
        }



      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    console.log({ currentUserId })
    const setupUnreadCountsListener = (users) => {


      console.log({ users })
      const counts = {};
      const timestamps = {}; // Object to track latest message timestamps


      users.forEach(user => {
        // console.log(`${user.uid}++${currentUserId}`)
        const messagesQuery = query(
          collection(db, "chats", `${user.uid}++${currentUserId}`, "messages"),
          where("receiverId", "==", currentUserId)
        );

        // Set up a real-time listener for each user's messages
        onSnapshot(messagesQuery, (snapshot) => {


          counts[user.uid] = snapshot.size; // Update unread count

          // Update latest message timestamp
          snapshot.forEach(doc => {

            // console.log({ doc })
            const messageData = doc.data();
            if (messageData.timestamp) {
              timestamps[user.uid] = timestamps[user.uid] || messageData.timestamp;
              if (messageData.timestamp.toMillis() > timestamps[user.uid].toMillis()) {
                timestamps[user.uid] = messageData.timestamp;
              }
            }
          });

          setUnreadCounts(prevCounts => ({
            ...prevCounts,
            [user.uid]: counts[user.uid],
          }));

          setLatestMessageTimestamps(prevTimestamps => ({
            ...prevTimestamps,
            ...timestamps,
          }));
        });




        const chatPath2 = `${currentUserId}++${user.uid}`;
        const q1 = query(
          collection(db, 'chats', chatPath2, 'messages'),
          orderBy('timestamp')
        );

        const unsubscribe1 = onSnapshot(q1, (snapshot) => {
          const filteredMessages = snapshot.docs;
          let messages = filteredMessages.map((doc) => ({ id: doc.id, ...doc.data() }))
          // console.log({ user, messages })




          let reduceUsers = users.reduce((accumulator, props) => {
            if (props.email === user.email) {
              accumulator.push({
                ...props,
                unreadMessageCount: messages.filter(m => !m.is_read).length,

              });
            } else {
              accumulator.push({ ...props });
            }
            return accumulator;
          }, []);




          console.log({ activeUsers })

          let mapped = reduceUsers.map((ru) => {
            let data = activeUsers.find(u => u.email === ru.email);
            return {
              ...ru,
              is_online: data && data.is_online
            }

          })

          console.log({ mapped })
          setUsers(mapped)







        });



      });
    };

    fetchUsers();
  }, [isAdmin, adminLoading, currentUserId, activeUsers]);

  const selectedUser = users.find(user => user.uid === selectedUserId);
  const selectedUserName = selectedUser ? selectedUser.displayName || selectedUser.email : "";

  // Sort users based on the latest message timestamps

  // console.log({ latestMessageTimestamps })
  const sortedUsers = users.sort((a, b) => {
    const nameA = a.displayName?.toLowerCase() || "";
    const nameB = b.displayName?.toLowerCase() || "";
    return nameA.localeCompare(nameB); // Sort by displayName
  });;
  // sort((a, b) => {
  //   const aTimestamp = latestMessageTimestamps[a.uid] || 0; // Default to 0 if no timestamp
  //   const bTimestamp = latestMessageTimestamps[b.uid] || 0; // Default to 0 if no timestamp
  //   return bTimestamp - aTimestamp; // Sort in descending order
  // });



  return isLoaded && (
    <div className="flex h-screen">
      <Sidebar
        users={sortedUsers} // Pass sorted users to Sidebar
        onUserSelect={setSelectedUserId}
        selectedUserId={selectedUserId}
        unreadCounts={unreadCounts}
      />
      <ChatInterface
        selectedUserId={selectedUserId}
        currentUserId={currentUserId}
        selectedUserName={selectedUserName}
        setUnreadCounts={setUnreadCounts}
        unreadCounts={unreadCounts}
      />
    </div>
  );
};

export default App;
