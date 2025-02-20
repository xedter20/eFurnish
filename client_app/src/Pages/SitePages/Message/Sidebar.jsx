// src/components/Sidebar.js
import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import useAuth from "../../../hooks/useAuth";
import axios from "axios";
import { getFirestore, collection, query, where, onSnapshot, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase.config";

const Sidebar = ({ users, onUserSelect, selectedUserId, unreadCounts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();


  const [usersWithName, setusersWithName] = useState(false);
  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, "users");

      const querySnapshot = await getDocs(usersRef);
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()  // Spread the document data into the object
      }));



      setusersWithName(usersList)

    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };






  useEffect(() => {

    fetchUsers();

  }, []);



  let filteredUsers = users.filter(u => u.email !== user?.email)
    .filter((user) => {
      return user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
    })
  // .sort((a, b) => {
  //   const nameA = a.displayName?.toLowerCase() || "";
  //   const nameB = b.displayName?.toLowerCase() || "";
  //   return nameA.localeCompare(nameB); // Sort by displayName
  // });;


  // filteredUsers.map(u => {
  //   console.log(u)
  // })





  return (
    <div className="w-200 h-full bg-gray-800 text-white overflow-y-auto">
      <h2 className="text-2xl p-4">Users</h2>
      <div className="p-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>


      <div className="space-y-2">
        {filteredUsers.map((user) => {
          let person = (usersWithName || []).find(u => u.email === user.email);

          let fullname = `${person?.name} ${person?.lastName}`;
          return <div
            key={user.uid}
            onClick={() => onUserSelect(user.uid)}
            className={`flex items-center p-4 cursor-pointer space-x-3 ${selectedUserId === user.uid ? "bg-blue-600" : "hover:bg-gray-700"}`}
          >
            <span
              className={`h-3 w-3 rounded-full ${user.is_online ? "bg-green-500" : "bg-gray-400"
                }`}
            ></span>


            <FaUserCircle className="text-2xl" />
            <span>{fullname}</span>
            {user.unreadMessageCount > 0 && (
              <div className="ml-auto relative inline-block px-3 py-1 text-sm font-medium leading-tight text-white bg-red-500 rounded-full">
                {user.unreadMessageCount}

              </div>
            )}

          </div>
        })}
        {filteredUsers.length === 0 && (
          <li className="p-4 text-gray-400">No users found</li>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
