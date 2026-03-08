import axios from "axios";

import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

const RoomCardClient = ({room}) => {

   const {getAccessTokenSilently} = useAuth0();

    const handleBooking = async () => {
            try {
                const token = await getAccessTokenSilently();
                const response = await axios.post(
                    `http://localhost:3002/api/v1/booking`,
                    {roomId: room._id},
                    {
                        headers: {Authorization: `Bearer ${token}`}
                    }
                );
                if (response.data.url) {
                    window.location.href = response.data.url
                }
            } catch (err) {
                console.log('Failed to create booking...');
                alert('Booking failed. Please try again.');
        }
    }

    const imgUrl = room.pictures && room.pictures.length > 0 ? room.pictures[0] : 'https://via.placeholder.com/400x300?text=No+Image+Available';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-lg transition-all">
            <img src={imgUrl} alt={room.title} className="w-full h-48 object-cover" />
            {/* Header (title, location) */}
            <div className="p-5 flex flex-col grow">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-800">{room.title}</h3>
                    <span className="bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1 rounded-full">{room.location}</span>
                </div>
                {/* Details section */}
                <div className="flex flex-col gap-2 mb-6 text-slate-600">
                    <p><span className="font-medium text-slate-800">Capacity:</span> {room.capacity} people</p>
                    <p><span className="font-medium text-slate-800">Price:</span> {room.basePrice} GBP/day</p>
                </div>
                {/* Bottoms actions (book) */}
                <div className="mt-auto flex flex-col gap-4">
                    <button onClick={handleBooking} className="w-full bg-slate-900 text-white font-medium py-2 rounded-md hover:bg-slate-800 hover:scale-102 transition-all">Book Room</button>
                </div>
            </div>
        </div>
    )
}


export default RoomCardClient