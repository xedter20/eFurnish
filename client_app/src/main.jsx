import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./Providers/AuthProvider";
import CartProvider from "./Providers/CartProvider";
import FavouriteProvider from "./Providers/FavouriteProvider";
import { router } from "./Routes/Routes";
import "@smastrom/react-rating/style.css";
import "./index.css";

// import Facebook from "./components/Facebook";
import initializeApp from './init';
// Initializing different libraries
initializeApp();


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <FavouriteProvider>
          <RouterProvider router={router} />
          <Toaster />
        </FavouriteProvider>
      </CartProvider>

    </AuthProvider>
  </React.StrictMode>,
);
