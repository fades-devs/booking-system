import axios from "axios";

import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

const ROOM_API_URL = import.meta.env.VITE_ROOM_API_URL

const RoomCardPartner = ({room, onCancel}) => {

    const [isEditing, setIsEditing] = useState(false)

    const [title, setTitle] = useState(room.title)
    const [capacity, setCapacity] = useState(room.capacity)
    const [basePrice, setBasePrice] = useState(room.basePrice)
    const [location, setLocation] = useState(room.location)

   const {getAccessTokenSilently} = useAuth0();

    const handleUpdate = async (e) => {

        e.preventDefault();

        try {
            const token = await getAccessTokenSilently();
            const response = await axios.put(
                `${ROOM_API_URL}/api/v1/rooms/${room._id}`,
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
            toast.success("Room updated successfully!")
            setIsEditing(false)

        } catch(err) {
            console.log('Failed to update room...', err);
            toast.error("Failed to update room.")
        }
        
    }

    const handleDelete = async () => {

        try {
            const token = await getAccessTokenSilently();
            const response = await axios.delete(
                `${ROOM_API_URL}/api/v1/rooms/${room._id}`,
                {
                    headers: {Authorization: `Bearer ${token}`}
                }
            )

            onCancel(room._id);
            toast.success("Room deleted successfully!")


        } catch(err) {
            console.log('Failed to delete room listing:', err)
            toast.error("Failed to delete room.")
        }
    }

    const imgUrl = room.pictures && room.pictures.length > 0 ? room.pictures[0] : 'https://placehold.co/600x400?text=No%20Available%20Image';

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
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-lg transition-all">
            
            <img src={imgUrl} alt={title} className="w-full h-48 object-cover" />
            <div className="p-5 flex flex-col grow">
                {/* Header (title, location) */}
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <span className="bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1 rounded-full">{location}</span>
                </div>
                {/* Details section */}
                <div className="flex flex-col gap-2 mb-6 text-slate-600">
                    <p><span className="font-medium text-slate-800">Capacity:</span> {capacity} people</p>
                    <p><span className="font-medium text-slate-800">Price:</span> {basePrice} GBP/day</p>
                </div>
                {/* Bottoms actions (book, update, delete) */}
                <div className="mt-auto flex flex-col gap-4">
                    <div className="flex justify-between border-t border-slate-100 pt-3">
                        <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-slate-400 hover:text-rose-400 transition-all cursor-pointer">Update</button>
                        <button onClick={handleDelete} className="text-sm font-medium text-slate-400 hover:text-rose-400 transition-all cursor-pointer">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default RoomCardPartner