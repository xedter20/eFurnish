import axios from "axios";

const initializeApp = () => {
  // Setting base URL for all API request via axios
  axios.defaults.baseURL = `${import.meta.env.VITE_REACT_APP_API_END_POINT}/api`;

  if (!import.meta.env.NODE_ENV || import.meta.env.NODE_ENV === "development") {
    // dev code
  } else {
    // Prod build code

    // Removing console.log from prod
    console.log = () => {};

    // init analytics here
  }
};

export default initializeApp;
