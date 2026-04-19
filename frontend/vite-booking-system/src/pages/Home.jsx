import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "../components/LoginButton";
import RoomCardClient from "../components/RoomCardClient";
import axios from "axios";
import { useState, useEffect } from "react";

const ROOM_API_URL = import.meta.env.VITE_ROOM_API_URL;

const Home = () => {
  const { user, isAuthenticated } = useAuth0();
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendAsleep, setBackendAsleep] = useState(false);

  useEffect(() => {
    const getRooms = async () => {
      try {
        const response = await axios.get(`${ROOM_API_URL}/api/v1/rooms`);
        setRooms(response.data);
      } catch (err) {
        if (err.message === "Network Error" || err.response?.status === 503) {
          setBackendAsleep(true);
        }
        else {
          setError(err);
          console.error("Failed to fetch data.");
        }
      } finally {
        setLoading(false);
      }
    };
    getRooms();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
  };

// --- THE UNAUTHENTICATED LANDING PAGE (HERO SECTION) ---
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-5 text-center">
        
        {/* Modern UI Badge */}
        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm mb-6 border border-slate-200">
          Conference Room Booking Platform
        </div>
        
        {/* High-Impact Headline with Gradient Text */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Book Conference Rooms <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Seamlessly
          </span>
        </h1>
        
        {/* Value Proposition Copy */}
        <p className="text-lg text-slate-500 max-w-2xl mb-10 leading-relaxed">
          Simple and easy workspace management. Powered by a scalable microservices architecture and real-time dynamic pricing.
        </p>
        
        {/* Call to Action Container */}
        <div className="flex flex-col sm:flex-row items-center gap-4 shadow-xl shadow-blue-900/5 rounded-lg p-2 bg-white border border-slate-100">
           <LoginButton />
           <span className="text-sm text-slate-400 px-4 hidden sm:block">Secure access via Auth0</span>
        </div>
        
      </div>
    );
  }

  if (backendAsleep) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center mt-10">
        
        {/* Animated Icon Container */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 text-amber-600 mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Live Backend Paused
        </h2>
        
        <p className="text-lg text-slate-600 max-w-xl mb-8 leading-relaxed">
          To optimize AWS cloud costs, the ECS Fargate microservices powering this platform are currently asleep.
          However, I can spin the full microservices back up instantly for a live demo. Let me know!
        </p>
      
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Flexbox layout (side by side or stacked for mobile) */}
      <div className="">
        {/* Title Section */}
        <div className="flex flex-col justify-between gap-3 mb-8">
          <h3 className="text-xl font-medium mb-1">Welcome, {user?.name}</h3>
          <h2 className="text-3xl font-bold">List of Conference Rooms</h2>
        </div>
        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-2 w-full md:w-auto pb-5"
        >
          <input
            type="text"
            placeholder="Search for specific room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 px-4 border border-slate-300 rounded-md outline-none focus:border-slate-900
                    transition-all w-full sm:w-64"
          ></input>
          <button
            type="submit"
            className="bg-slate-900 text-white font-medium px-5 py-2
                    rounded-md hover:bg-slate-700 hover:scale-105 transition-all cursor-pointer"
          >
            Search
          </button>
        </form>
        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms
            .filter((room) =>
              room.title.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .map((room) => (
              <RoomCardClient room={room} key={room._id} />
            ))}
        </div>
        {/* If no results */}
        {rooms.length > 0 &&
          !rooms.some((room) =>
            room.title.toLowerCase().includes(searchQuery.toLowerCase()),
          ) && (
            <div className="text-center text-slate-500 py-10 w-full col=span-full">
              No rooms found matching "{searchQuery}"
            </div>
          )}
      </div>
    </div>
  );
};

export default Home;
