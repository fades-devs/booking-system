
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from '../components/LoginButton';
import LogoutButton from '../components/LogoutButton';
import RoomCard from "../components/RoomCard";
import axios from "axios";
import { useState, useEffect } from "react";

const Home = () => {

    const {user, isAuthenticated} = useAuth0();

    const [searchQuery, setSearchQuery] = useState('');
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // const rooms = [
    //     {id: 1, title: 'Test 1', capacity: 10, basePrice: 100, location: 'Dundee'},
    //     {id: 2, title: 'Test 2', capacity: 20, basePrice: 200, location: 'York'},
    // ]

    useEffect(() => {
        const getRooms = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/v1/rooms`);
                setRooms(response.data);
            } catch (err) {
                setError(err);
                console.log('Failed to get rooms...', err);
            } finally {
                setLoading(false);
            }
        }
        getRooms();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault()
    }
    
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center bg-slate-200 py-24 px-5 rounded-2xl my-10">
            <h1 className="text-5xl text-center font-bold mb-4">Welcome to ConfBook</h1>
            <h5 className="text-lg text-center text-slate-600 mb-8">Conference Room Booking Website</h5>
            <LoginButton />
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
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto pb-5">
                    <input type="text" placeholder="Search for specific room..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 px-4 border border-slate-300 rounded-md outline-none focus:border-slate-900
                    transition-all w-full sm:w-64"></input>
                    <button type="submit" className="bg-slate-900 text-white font-medium px-5 py-2
                    rounded-md hover:bg-slate-700 hover:scale-105 transition-all cursor-pointer">Search</button>
                </form>
                {/* Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.filter((room) => room.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((room) => (<RoomCard room={room} key={room._id} />))
                    }
                </div>
                {/* If no results */}
                {
                    rooms.length > 0 && !rooms.some(room => room.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
                    (<div className="text-center text-slate-500 py-10 w-full col=span-full">
                        No rooms found matching "{searchQuery}"
                    </div> )
                }
            </div>

        </div>

    )
}

export default Home