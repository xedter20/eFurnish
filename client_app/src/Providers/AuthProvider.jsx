import { createContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendEmailVerification
} from "firebase/auth";
import { app } from "../firebase/firebase.config";

import { getFirestore, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";


const db = getFirestore();

import axios from "axios";

export const AuthContext = createContext(null);

import toast from "react-hot-toast";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const updateOnlineStatus = async (email, status) => {
  try {
    const userRef = doc(db, "users", email); // Get user document reference in Firestore
    await updateDoc(userRef, { is_online: status }); // Set is_online to false
  } catch (error) {
    console.error("Error updating online status:", error);
  }
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign-up new user using Email and Password
  const createUser = async (email, password, otherProps) => {
    setLoading(true);

    console.log({ email, password, otherProps })
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);




    console.log({ otherProps })
    // Save user role in Firestore
    const user = userCredential.user;

    console.log({ user })

    try {

      console.log(1)

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: 'user', // 'admin' or 'user'
        ...otherProps
      });

      console.log(2)
      await sendEmailVerification(userCredential.user)
        .then(() => {
          console.log("Verification email sent successfully.");
        })
        .catch((error) => {
          console.error("Error sending verification email:", error.message);
        });


      console.log(3)
      toast.success("Your account has been created successfully 🎉. Now, just check your inbox to verify your email and you're all set!");
    } catch (error) {
      console.log({ error })
    }
    return userCredential;
  };

  // Email and Password Login
  const signIn = async (email, password) => {
    setLoading(true);



    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    console.log({ user })

    // Retrieve the email from the user object
    const useEmail = user.email;

    // Optionally, you can also log the email or use it for further operations


    // Reference to the user document in Firestore
    const userRef = doc(db, "users", useEmail); // Assuming "users" is your collection

    // // Check if the user already exists in the collection
    const userDoc = await getDoc(userRef);

    // // console.log({ userDoc })

    if (!userDoc.exists()) {
      // If user doesn't exist, create a new document with the user's data
      // await setDoc(userRef, {
      //   email: user.email,
      //   uid: user.uid,
      //   displayName: user.displayName || "", // Include any other user data you need
      //   createdAt: new Date()

      // });
      console.log("User added to Firestore.");
    } else {
      console.log("User already exists in Firestore.");
    }

    await updateOnlineStatus(user.email, true);

    return userCredential;

  };

  //  Google Login
  const googleSignIn = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  // Update user profile name
  const updateUserProfile = (name, photo) => {
    setLoading(true);
    if (name && photo) {
      return updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photo,
      });
    } else {
      return updateProfile(auth.currentUser, {
        displayName: name,
      });
    }
  };

  // Log out
  const logOut = async () => {
    setLoading(true);

    const user = auth.currentUser; // Get current logged-in user

    if (user) {
      // Update user's `is_online` status to `false` before signing out
      await updateOnlineStatus(user.email, false);
    }


    return signOut(auth);
  };

  // Delete User's Account
  const deleteAccount = () => {
    setLoading(true);
    return deleteUser(auth.currentUser);
  };

  // authentication observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(true);

      if (currentUser) {
        try {
          const res = await axios.post(`/jwt`, {
            email: currentUser.email,
          });
          localStorage.setItem("access-token", res.data.token);
        } catch (error) {
          console.error("Error fetching token:", error);
        }
      } else {
        localStorage.removeItem("access-token");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);



  // Monitor if the user is logged in
  const useAuthStatus = (auth) => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in
          console.log("User is currently logged in:", user);
          setCurrentUser(user);
        } else {
          // User is signed out
          console.log("User is not logged in");
          setCurrentUser(null);
        }
      });

      return () => unsubscribe(); // Cleanup listener on component unmount
    }, [auth]);

    return currentUser;
  };

  const authInfo = {
    loading,
    user,
    signIn,
    googleSignIn,
    createUser,
    updateUserProfile,
    logOut,
    setLoading,
    setUser,
    deleteAccount,
    useAuthStatus
  };
  return (
    <AuthContext.Provider
      value={authInfo}


    >{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
