import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShoppingCart,
  Heart,
  List,
  User,
  Search,
  MessageCircle,
  Bell
} from "lucide-react";
import SearchResultDropDown from "../../DropDowns/SearchResultDropDown/SearchResultDropDown";
import UserDropDown from "../../DropDowns/UserDropDown/UserDropDown";
import SidebarCart from "../../SidebarCart/SidebarCart";
import MobileNavbar from "./MobileNavbar";
import useDebounce from "../../../hooks/useDebounce";
import { navItems } from "../../../assets/data/navItems";
import logo from "../../../assets/logo/logo.png";
import useAdmin from "../../../hooks/useAdmin";
import useAuth from "../../../hooks/useAuth";
import useCart from "../../../hooks/useCart";
import useFavourite from "../../../hooks/useFavourite";
import CustomAlert from '../../Alerts/CustomAlert';

import { getFirestore, collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../../firebase/firebase.config";

import io from 'socket.io-client';

const socket = io('https://localhost:5000'); // Connect to the server

const Navbar = () => {
  // Context
  const { user } = useAuth();

  const currentUserId = user?.uid;
  const currentUserEmail = user?.email;

  console.log({ currentUserEmail })

  const cartContext = useCart();
  const { getFavouriteItems, favouriteItems, setFavouriteItems } =
    useFavourite();

  // Check user admin status
  const { isAdmin } = useAdmin();

  // State
  const [showMenu, setShowMenu] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [unreadMessageCount, setUnreadMessageCount] = useState([]);

  // Ref
  const sideBarRef = useRef();
  const menuRef = useRef();

  // Router
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  // Debounce search input
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Check if the cart context is available
  const cart = cartContext?.cart || [];
  const setCart = cartContext?.setCart || (() => { });

  // Fetch favourite items of a user
  useEffect(() => {
    getFavouriteItems();
  }, [getFavouriteItems]);

  // Perform search when debounced search value changes
  useEffect(() => {
    if (debouncedSearchValue === "" || debouncedSearchValue.length === 0) {
      return setSearchResults([]);
    } else {
      axios
        .get(`${import.meta.env.VITE_REACT_APP_API_END_POINT}/products/search/${debouncedSearchValue}`)
        .then((res) => setSearchResults(res.data))
        .catch((err) => console.error(err));
    }
  }, [debouncedSearchValue]);

  // Clear search input and results
  const clearSearch = () => {
    setSearchValue("");
    setSearchResults([]);
  };

  // Handle form submission for search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchText = e.target.search.value;
    navigate(`/search/${searchText}`);
    clearSearch();
  };

  // Toggle mobile menu Visibility
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target === sideBarRef.current || e.target === menuRef.current) {
        setShowMenu(!showMenu);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    const setupUnreadCountsListener = (users) => {
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
          const filteredMessages = snapshot.docs;
          let messages = filteredMessages.map((doc) => ({ id: doc.id, ...doc.data() }))
        });

        const chatPath2 = `${currentUserId}++${user.uid}`;
        const q1 = query(
          collection(db, 'chats', chatPath2, 'messages'),
          orderBy('timestamp')
        );

        const unsubscribe1 = onSnapshot(q1, (snapshot) => {
          const filteredMessages = snapshot.docs;
          let messages = filteredMessages.map((doc) => ({ id: doc.id, ...doc.data() }))

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
          }, [])

          // Calculate total unreadMessageCount from reduceUsers
          let totalUnreadMessageCount = reduceUsers.reduce(
            (total, user) => total + (user.unreadMessageCount || 0),
            0
          );

          setUnreadMessageCount(totalUnreadMessageCount);
        });
      });
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('/users/getAllUsers');
        const usersData = response.data;

        const filteredUsers = isAdmin
          ? usersData
          : usersData.filter((u) => u.email === 'admin-efurnish@gmail.com');

        setupUnreadCountsListener(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [currentUserId]);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [isLoaded, setIsLoaded] = useState(true);

  const fetchNotifs = async (recieverEmail) => {
    await axios
      .post("/orders/notifications/all", {
        recieverEmail: recieverEmail
      })
      .then((res) => {
        let notifications = res.data.notifications
        setNotifications(notifications);
        setIsLoaded(true)
      });
  }

  useEffect(() => {
    if (currentUserEmail) {
      fetchNotifs(currentUserEmail)
    }
  }, []);

  useEffect(() => {
    // Listen for notifications from the server
    socket.on('receiveNotification', async (data) => {
      await fetchNotifs(data.recieverEmail)
      setIsLoaded(true)
    });

    // Clean up on component unmount
    return () => {
      socket.off('receiveNotification');
    };
  }, []);

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
  const [visibleCount, setVisibleCount] = useState(5); // Show initial 5 notifications

  const handleSeeMore = () => {
    setVisibleCount((prevCount) => prevCount + 5); // Show 5 more on each click
  };

  const visibleNotifications = notifications.slice(0, visibleCount);

  const [alert, setAlert] = useState({ message: '', type: '' });

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 3000); // Auto-hide after 3 seconds
  };

  return (
    <header className="bg-[#BA8A5B] shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <Link to="/shop" className="flex items-center rounded">
          <div className="bg-gray-200 p-2 rounded-lg">
            <img src={logo} alt="Logo" className="h-10 w-10" />
          </div>
          <span className="ml-3 text-xl font-semibold text-white">EFurnish</span>
        </Link>

        {alert.message && <CustomAlert message={alert.message} type={alert.type} />}

        {/* Search Bar */}


        {/* Navigation Links and Icons */}
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex space-x-6">
            {isAdmin || !isAdmin && navItems.map((nav) => (
              <Link
                to={nav.link}
                key={nav.text}
                className="
                text-white
                hover:text-[#D8BDA2] active:text-[#7B5733] transition-colors"
              >
                {nav.text}
              </Link>
            ))}
          </nav>
          <Link to="/cart" className="relative">
            <ShoppingCart className="text-2xl text-white" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#5A8ABA] text-white text-xs rounded-full 
              w-5 h-5 flex items-center justify-center text-center text-white bg-orange-500">
                {cart.length}
              </span>
            )}
          </Link>
          {user ? (
            <UserDropDown setFavouriteItems={setFavouriteItems} setCart={setCart} />
          ) : (
            <Link to="/login">
              <User className="text-2xl text-white" />
            </Link>
          )}
          <button onClick={() => setShowMenu(!showMenu)} className="md:hidden">
            <List className="text-2xl text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="md:hidden">
          <MobileNavbar
            {...{
              navItems: [
                { text: "Home", link: "/" },
                { text: "Shop", link: "/shop" },
                { text: "Categories", link: "/categories" },
                { text: "Deals", link: "/deals" },
                { text: "Contact", link: "/contact" },
              ],
              showMenu,
              setShowMenu,
              setCart,
              menuRef,
              sideBarRef,
            }}
          />
        </div>
      )}
    </header>
  );
};

export default Navbar;
