import { useAuth0 } from "@auth0/auth0-react";
import Booking from "../components/Booking";
import { useEffect, useState } from "react";
import axios from "axios";
import LoginButton from "../components/LoginButton";

const BOOKING_API_URL = import.meta.env.VITE_BOOKING_API_URL;

const MyBookings = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getBookings = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `${BOOKING_API_URL}/api/v1/bookings/by-client`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setBookings(response.data);
      } catch (err) {
        setError(err);
        console.log("Failed to get bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    getBookings();
  }, []);

  const removeBookingScreen = (deletedId) => {
    setBookings((prevBookings) =>
      prevBookings.filter((b) => b._id !== deletedId),
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-5 bg-white rounded-2xl shadow-sm my-10 border border-slate-100 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Access Denied
        </h2>
        <p className="text-slate-600 text-center mb-6">
          You must be authenticated to access your bookings.
        </p>
        <LoginButton />
      </div>
    );
  }

  // --- Filtering Logic ---
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day comparison
  const currentBookings = bookings.filter((b) => {
    const bDate = new Date(b.createdAt);
    return bDate >= today && b.status !== "Cancelled";
  });

  const previousBookings = bookings.filter((b) => {
    const bDate = new Date(b.createdAt);
    return bDate < today || b.status === "Cancelled";
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-5 sm:p-10">
      {/* Page header */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-slate-500 mt-2">
          Manage your conference room bookings.
        </p>
      </div>
      {/* List container */}
      <div className="flex flex-col gap-10">
        {/* Current Bookings */}
        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Current Bookings</h2>
          <div className="flex flex-col gap-4">
            {currentBookings.length > 0 ? (
              currentBookings.map((booking) => (
                <Booking
                  booking={booking}
                  key={booking._id}
                  onCancel={removeBookingScreen}
                  isPast={false}
                />
              ))
            ) : (
              <div className="py-8 bg-slate-50 rounded-xl border-2 border-slate-200 border-dashed text-center">
                <p className="text-slate-500 font-medium">You don't have any active bookings.</p>
              </div>
            )}
          </div>
        </section>
        {/* Previous Bookings */}
        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Previous & Cancelled Bookings</h2>
          <div className="flex flex-col gap-4">
            {previousBookings.length > 0 ? (
              previousBookings.map((booking) => (
                <Booking
                  booking={booking}
                  key={booking._id}
                  onCancel={removeBookingScreen}
                  isPast={true} 
                />
              ))
            ) : (
              <div className="py-8 bg-slate-50 rounded-xl border-2 border-slate-200 border-dashed text-center">
                <p className="text-slate-500 font-medium">No previous bookings found.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyBookings;
