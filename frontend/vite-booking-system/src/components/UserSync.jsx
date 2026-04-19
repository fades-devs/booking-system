import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const UserSync = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const syncUserToDatabase = async () => {
      // Only run this if Auth0 says they are successfully logged in
      if (isAuthenticated && user) {
        try {
          // 1. Get the raw JWT token from Auth0 so backend trusts the request
          const token = await getAccessTokenSilently();
          
          // 2. Make the POST request to API Gateway
          await axios.post(
            `${import.meta.env.VITE_USER_API_URL}/api/v1/auth/sync`, 
            {
              name: user.name,
              email: user.email
            }, 
            {
              headers: {
                Authorization: `Bearer ${token}` 
              }
            }
          );
          console.log("User successfully synced to MongoDB!");
          
        } catch (error) {
            if (error.message === "Network Error" || error.response?.status >= 500) {
            console.log("Backend asleep: Skipping user sync.");
            return;
          }
          // Log real errors if the backend is actually awake but failing
          console.log("Failed to sync user to database:", err);
        }
      }
    };

    syncUserToDatabase();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // This component doesn't show any UI, it just runs logic in the background
  return null; 
};

export default UserSync;