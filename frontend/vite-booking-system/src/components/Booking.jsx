import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

const BOOKING_API_URL = import.meta.env.VITE_BOOKING_API_URL;

const Booking = ({ booking, onCancel, isPast }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleCancel = async () => {

    if (isPast) return; // security check
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.delete(
        `${BOOKING_API_URL}/api/v1/bookings/${booking._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      onCancel(booking._id);
      toast.success("Booking cancelled!");
    } catch (err) {
      console.log("Error cancelling the booking:", err);
      setError(err);
      toast.error("Failed to cancel booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 hover:shadow-md transition-shadow mb-4">
      {/* Booking information */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-800">
            {booking.roomName}
          </h2>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {booking.status}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:gap-8 text-sm text-slate-600 mt-1">
          <p>
            <span className="font-semibold text-slate-700">Booked for:</span>{" "}
            {booking.createdAt.split("T")[0]}
          </p>
          <p>
            <span className="font-semibold text-slate-700">Total Price:</span>{" "}
            {booking.finalPrice} GBP
          </p>
        </div>
      </div>
      {/* Action button */}
      <button
        onClick={handleCancel} disabled={isPast || loading}
        className={`w-full sm:w-auto whitespace-nowrap px-5 py-2 border-2 rounded-md font-medium transition-all ${
          isPast
            ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
            : "border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-200 cursor-pointer"
        }`}
      >
        {isPast ? "Unavailable" : loading ? "Cancelling..." : "Cancel Booking"}
      </button>
    </div>
  );
};

export default Booking;
