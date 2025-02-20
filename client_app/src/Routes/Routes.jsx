import { createBrowserRouter } from "react-router-dom";
import Main from "../layouts/Main";
import Home from "../Pages/SitePages/Home/Home";
import Shop from "../Pages/SitePages/Shop/Shop";
import Contact from "../Pages/SitePages/Contact/Contact";
import ProductDetails from "../Pages/SitePages/ProductDetails/ProductDetails";
import CategoryProduct from "../Pages/SitePages/CategoryProduct/CategoryProduct";
import Login from "../Pages/SitePages/Login/Login";
import Signup from "../Pages/SitePages/Signup/Signup";
import Cart from "../Pages/SitePages/Cart/Cart";
import Favourite from "../Pages/SitePages/Favourite/Favourite";
import Search from "../Pages/SitePages/Search/Search";
import Checkout from "../Pages/SitePages/Checkout/Checkout";
import PrivateRoute from "./PrivateRoute";
import MyOrders from "../Pages/DashBoard/UserDashboard/MyOrders/MyOrders";
import AccountSettings from "../Pages/DashBoard/UserDashboard/AccountSettings/AccountSettings";
import ErrorPage from "../Pages/SitePages/ErrorPage/ErrorPage";
import About from "../Pages/SitePages/About/About";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../Pages/DashBoard/AdminDashboard/Dashboard/Dashboard";
import Orders from "../Pages/DashBoard/AdminDashboard/Orders/Orders";
import ProductManagement from "../Pages/DashBoard/AdminDashboard/ProductManagement/ProductManagement";
import AddProducts from "../Pages/DashBoard/AdminDashboard/AddProducts/AddProducts";

import VideoTutorials from "../Pages/SitePages/About/VideoTutorials"
import Membership from "../Pages/SitePages/About/Membership"


import MembersManagement from "../Pages/DashBoard/AdminDashboard/MembershipManagement/MembershipManagement";

import OrdersNew from "../Pages/DashBoard/AdminDashboard/Orders/OrdersNew";

import MemberProfile from "../Pages/DashBoard/AdminDashboard/MembershipManagement/MemberProfile";
import OrderDetails from "../Pages/DashBoard/UserDashboard/MyOrders/OrderDetails";
import AdminOrderDetails from "../Pages/DashBoard/AdminDashboard/Orders/OrderDetails";

import Messages from "../Pages/SitePages/Message";

import Settings from "../Pages/DashBoard/AdminDashboard/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/shop",
        element: <Shop />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/products/:id",
        element: <ProductDetails />,
        loader: ({ params }) =>
          fetch(`${import.meta.env.VITE_REACT_APP_API_END_POINT}/api/products/${params.id}`),
        errorElement: <ErrorPage />,
      },
      {
        path: "/products",
        element: <CategoryProduct />,
      },
      {
        path: "/search/:key",
        element: <Search />,
        loader: ({ params }) =>
          fetch(`${import.meta.env.VITE_REACT_APP_API_END_POINT}/api/products/search/${params.key}`),
        errorElement: <ErrorPage />,
      },
      {
        path: "/cart",
        element: (
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        ),
      },
      {
        path: "favourite",
        element: (
          <PrivateRoute>
            <Favourite />
          </PrivateRoute>
        ),
      },
      {
        path: "/checkout",
        element: (
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        ),
      },
      // User Dashboard Routes
      {
        path: "/my-orders",
        element: (
          <PrivateRoute>
            <MyOrders />
          </PrivateRoute>
        ),
      },
      {
        path: "/my-order/:id",
        element: <OrderDetails />,
      },

      {
        path: "/account-settings",
        element: (
          <PrivateRoute>
            <AccountSettings />
          </PrivateRoute>
        ),
      },
      {
        path: "/video-tutorials",
        element: (
          <PrivateRoute>
            <VideoTutorials />
          </PrivateRoute>
        ),
      },
      {
        path: "/membership",
        element: (
          <PrivateRoute>
            <Membership />
          </PrivateRoute>
        ),
      },
      {
        path: "/messages",
        element: <Messages />,
      },
    ],
  },
  // Admin Dashboard Routes
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/dashboard/orders",
        element: <Orders />,
      },
      {
        path: "/dashboard/products",
        element: <ProductManagement />,
      },
      {
        path: "/dashboard/add-product",
        element: <AddProducts />,
      },
      {
        path: "/dashboard/membership",
        element: <MembersManagement />,
      },
      {
        path: "/dashboard/membership/:id",
        element: <MemberProfile />,
      },
      {
        path: "/dashboard/orders_new",
        element: <OrdersNew />,
      },
      {
        path: "/dashboard/orders_new/:id",
        element: <AdminOrderDetails />,
      },
      {
        path: "/dashboard/messages",
        element: <Messages />,
      },
      {
        path: "/dashboard/settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);
