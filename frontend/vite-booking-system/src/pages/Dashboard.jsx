import { useAuth0 } from "@auth0/auth0-react";
import RoomCardPartner from "../components/RoomCardPartner";
import { useState, useEffect } from "react";
import axios from "axios";
import CreateListing from "../components/CreateListing";
import LoginButton from "../components/LoginButton";

const ROOM_API_URL = import.meta.env.VITE_ROOM_API_URL;

const Dashboard = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPartnerRooms = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `${ROOM_API_URL}/api/v1/rooms/by-partner`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setRooms(response.data);
      } catch (err) {
        console.log("Failed to get partner rooms:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    getPartnerRooms();
  }, []);

  const removeRoomScreen = (deletedId) => {
    setRooms((prevRooms) => prevRooms.filter((r) => r._id !== deletedId));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-5 bg-white rounded-2xl shadow-sm my-10 border border-slate-100 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Access Denied
        </h2>
        <p className="text-slate-600 text-center mb-6">
          You must be authenticated to access your dashboard.
        </p>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-5 sm:p-10">
      {/* Create room listing section */}
      <CreateListing />
      {/* My listings section */}
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-bold text-slate-900">My Listings</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <RoomCardPartner
              room={room}
              key={room._id}
              onCancel={removeRoomScreen}
            />
          ))
        ) : (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-500 font-medium">
            No room listings yet. Create new listing using the form above.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
