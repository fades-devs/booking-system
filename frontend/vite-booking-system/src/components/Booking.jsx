import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const Booking = ({booking}) => {

    const {getAccessTokenSilently} = useAuth0();


    const handleCancel = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await axios.delete(`http://localhost:3002/api/v1/bookings/${booking._id}`,
                {
                    headers: {Authorization: `Bearer ${token}`}
                }
            );

        } catch(err) {
            console.log('Error cancelling the booking:', err)
            alert('Failed to cancel the booking...')
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 hover:shadow-md transition-shadow mb-4">
            {/* Booking information */}
            <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-800">{booking.roomName}</h2>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{booking.status}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-8 text-sm text-slate-600 mt-1">
                    <p><span className="font-semibold text-slate-700">Booked for:</span> {booking.createdAt.split('T')[0]}</p>
                    <p><span className="font-semibold text-slate-700">Total Price:</span> {booking.finalPrice} GBP</p>
                </div>
            </div>
            {/* Action button */}
            <button onClick={handleCancel} className="w-full sm:w-auto whitespace-nowrap px-5 py-2 border-2 border-rose-100 bg-rose-50 text-rose-600 rounded-md font-medium hover:bg-rose-100 hover:border-rose-200 transition-all">
                Cancel Booking
            </button>
        </div>
    )

}

export default Booking