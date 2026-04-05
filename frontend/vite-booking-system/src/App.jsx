import "./App.css";
import { Route, Routes } from "react-router-dom";
import { useIdleTimer } from "react-idle-timer";
import toast, { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import MyBookings from "./pages/MyBookings";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import { useAuth0 } from "@auth0/auth0-react";
import UserSync from "./components/UserSync";

function App() {
  const { logout, isAuthenticated } = useAuth0();

  const onIdle = () => {
    if (isAuthenticated) {
      toast("You have been logged out due to inactivity.");
      logout({ logoutParams: { returnTo: window.location.origin } });
    }
  };

  useIdleTimer({
    onIdle,
    timeout: 1000 * 60 * 20, // 15 mins
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-slate-900 text-white p-5">
        <Navbar />
        <UserSync />
      </header>
      <main className="flex flex-col grow w-full mx-auto p-5">
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toasterId="default"
          toastOptions={{
            // Define default options
            className: "",
            duration: 5000,
            removeDelay: 1000,
            style: {
              background: "#363636",
              color: "#fff",
            },

            // Default options for specific types
            success: {
              duration: 3000,
              iconTheme: {
                primary: "green",
                secondary: "black",
              },
            },
          }}
        />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/dashboard" element={<Dashboard />}></Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
