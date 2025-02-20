import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo/logo.png";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Bell,
  LogOut,
  Menu,
  Users, CreditCard
} from "lucide-react";
import MobileDashNav from "../components/MobileDashNav/MobileDashNav";
import useAdmin from "../hooks/useAdmin";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import axios from "axios";
// import Navbar from "../components/Shared/Navbar/Navbar";
import io from 'socket.io-client';
const socket = io('https://https://localhost:5000'); // Connect to the server

const AdminLayout = () => {
  const [showNavbar, setShowNavbar] = useState(false);
  const sideBarRef = useRef();
  const navigate = useNavigate();

  const { logOut } = useAuth();

  // Check currently logged in user email is admin email or not
  const { isAdmin, adminLoading } = useAdmin();

  console.log({ isAdmin })

  // Toggle mobile dashboard side navbar visibility
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target === sideBarRef.current) {
        setShowNavbar(!showNavbar);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [showNavbar]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/");
    }
  }, [adminLoading, isAdmin, navigate]);

  // Handle user logout
  const handleUserLogOut = () => {
    logOut()
      .then(() => {
        toast.success("Logged out!");
        navigate("/");
      })
      .catch((err) => console.log(err));
  };

  const { user } = useAuth();



  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const currentUserEmail = user?.email;


  console.log({ currentUserEmail })
  const fetchNotifs = async (recieverEmail) => {
    await axios
      .post("/orders/notifications/all", {

      })
      .then((res) => {

        let notifications = res.data.notifications

        console.log({ notifications })
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


  console.log({ notifications })
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

  const visibleNotifications = notifications.slice(0, visibleCount).filter(i => !!i.message);
  return (
    <section className="mx-auto w-full font-Poppins md:flex">
      {/* Small device navbar toggle button */}
      <div
        onClick={() => setShowNavbar(true)}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        <button className="p-2 rounded-lg bg-base text-white hover:bg-base-dark transition-colors">
          <Menu size={24} />
        </button>
      </div>
      {/* {showNavbar && (
        <MobileDashNav sideBarRef={sideBarRef} setShowNavbar={setShowNavbar} />
      )} */}

      {/* Side Navigation */}
      <nav className="hidden md:flex flex-col justify-between fixed h-full w-72 bg-gradient-to-b from-base to-base-dark text-white p-6">
        {/* Logo Section */}
        <div>
          <NavLink to="/" className="flex items-center justify-center mb-10">
            <div className="w-16 h-16 flex items-center justify-center bg-white/50 rounded-2xl">
              <img src={logo} alt="Logo" className="w-12 h-12" />
            </div>
          </NavLink>

          {/* Navigation Links */}
          <div className="space-y-2">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? "bg-white/20 text-white font-medium shadow-lg shadow-black/5"
                  : "hover:bg-white/10 text-white/80"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/orders_new"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? "bg-white/20 text-white font-medium shadow-lg shadow-black/5"
                  : "hover:bg-white/10 text-white/80"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <ShoppingCart size={20} />
                  <span>Orders</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/products"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? "bg-white/20 text-white font-medium shadow-lg shadow-black/5"
                  : "hover:bg-white/10 text-white/80"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Package size={20} />
                  <span>Products</span>
                </>
              )}
            </NavLink>
            <NavLink
              to="/dashboard/suppliers"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? "bg-white/20 text-white font-medium shadow-lg shadow-black/5"
                  : "hover:bg-white/10 text-white/80"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Users size={20} />
                  <span>Suppliers</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/payments"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? "bg-white/20 text-white font-medium shadow-lg shadow-black/5"
                  : "hover:bg-white/10 text-white/80"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <CreditCard size={20} />
                  <span>Payments</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? "bg-white/20 text-white font-medium shadow-lg shadow-black/5"
                  : "hover:bg-white/10 text-white/80"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Users size={20} />
                  <span>Users</span>
                </>
              )}
            </NavLink>

          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleUserLogOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 md:ml-72 min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex justify-end">
            <div className="relative">
              {/* Bell icon */}
              <button
                onClick={handleBellClick}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Bell
                  size={20}
                  className="text-gray-600"
                />
                {/* Notification badge */}
                {visibleNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {visibleNotifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div
                  ref={notificationRef}
                  className="absolute right-0 mt-3 bg-white rounded-xl shadow-lg w-80 z-10 border border-gray-100 overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="font-medium text-gray-900">Notifications</h3>
                  </div>

                  {/* Notification List */}
                  <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                    {visibleNotifications.length > 0 ? (
                      <>
                        {visibleNotifications.filter(i => !!i.message).map((notification, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              navigate(`/dashboard/orders_new`);
                              setIsNotificationOpen(false);
                            }}
                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex gap-3 items-start">
                              <div className="p-2 bg-[#BA8A5B] bg-opacity-10 rounded-full">
                                <ShoppingCart size={16} className="text-[#BA8A5B]" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {/* Add timestamp if available */}
                                  Just now
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* See More Button */}
                        {visibleCount < notifications.length && (
                          <button
                            onClick={handleSeeMore}
                            className="w-full px-4 py-3 text-sm text-[#BA8A5B] hover:bg-[#BA8A5B] hover:bg-opacity-5 transition-colors"
                          >
                            See more notifications
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell size={24} className="text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </section>
  );
};

export default AdminLayout;
