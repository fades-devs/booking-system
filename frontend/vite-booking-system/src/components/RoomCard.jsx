import axios from "axios";

import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

const RoomCard = ({room, onCancel}) => {

    const [isEditing, setIsEditing] = useState(false)

    const [title, setTitle] = useState('')
    const [capacity, setCapacity] = useState('')
    const [basePrice, setBasePrice] = useState('')
    const [location, setLocation] = useState('')

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

    const handleUpdate = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = axios.put(
                `http://localhost:3001/api/v1/rooms/${room._id}`,
                {
                    title: title,
                    capacity: capacity,
                    basePrice: basePrice,
                    location: location
                },
                {
                    headers: {Authorization: `Bearer ${token}`}
                }
            )
            alert('Room updated successfully!')
        } catch(err) {
            console.log('Failed to update room...', err);
        }
    }

    const handleDelete = async () => {

        try {
            const token = await getAccessTokenSilently();
            const response = axios.delete(
                `http://localhost:3001/api/v1/rooms/${room._id}`,
                {
                    headers: {Authorization: `Bearer ${token}`}
                }
            )

            onCancel(room._id);


        } catch(err) {
            console.log('Failed to delete room listing:', err)
        }
    }

    if (isEditing) {
        return (
            <div className="bg-white rounded-xl shadow-md p-5 border border-slate-200 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Room Listing</h3>
            <form onSubmit={handleUpdate} className="flex flex-col gap-3">
            <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-600 mb-1">Room Title</label>
                <input type="text" placeholder={room.title} value={title} onChange={(e) => setTitle(e.target.value)}
                className="border border-slate-300 rounded-md p-2 focus:outline-none focus:border-rose-400 transition-all"></input>
            </div>
            <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-600 mb-1">Room Capacity</label>
                <input type="text" placeholder={room.capacity} value={capacity} onChange={(e) => setCapacity(e.target.value)}
                className="border border-slate-300 rounded-md p-2 focus:outline-none focus:border-rose-400 transition-all"></input>
            </div>
            <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-600 mb-1">Room Base Price</label>
                <input type="text" placeholder={room.basePrice} value={basePrice} onChange={(e) => setBasePrice(e.target.value)}
                className="border border-slate-300 rounded-md p-2 focus:outline-none focus:border-rose-400 transition-all"></input>
            </div>
            <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-600 mb-1">Room Location</label>
                <input type="text" placeholder={room.location} value={location} onChange={(e) => setLocation(e.target.value)}
                className="border border-slate-300 rounded-md p-2 focus:outline-none focus:border-rose-400 transition-all"></input>
            </div>
            {/* Action buttons for update and cancel */}
            <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-slate-900 text-white font-medium py-2 rounded-md grow hover:bg-slate-800 transition-all">Save</button>
                <button type="button" onClick={() => setIsEditing(false)} className="bg-slate-200 text-slate-700 font-medium py-2 rounded-md grow hover:bg-slate-300 transition-all">Cancel</button>
            </div>
        </form>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col hover:shadow-lg transition-all">
            {/* Header (title, location) */}
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-800">{room.title}</h3>
                <span className="bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1 rounded-full">{room.location}</span>
            </div>
            {/* Details section */}
            <div className="flex flex-col gap-2 mb-6 text-slate-600">
                <p><span className="font-medium text-slate-800">Capacity:</span> {room.capacity} people</p>
                <p><span className="font-medium text-slate-800">Price:</span> {room.basePrice} GBP/day</p>
            </div>
            {/* Bottoms actions (book, update, delete) */}
            <div className="mt-auto flex flex-col gap-4">
                <button onClick={handleBooking} className="w-full bg-slate-900 text-white font-medium py-2 rounded-md hover:bg-slate-800 hover:scale-102 transition-all">Book Room</button>
                <div className="flex justify-between border-t border-slate-100 pt-3">
                    <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-slate-400 hover:text-rose-400 transition-all">Update</button>
                    <button onClick={handleDelete} className="text-sm font-medium text-slate-400 hover:text-rose-400 transition-all">Delete</button>
                </div>
            </div>
        </div>
    )
}


export default RoomCard