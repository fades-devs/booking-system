
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from '../components/client/LoginButton';
import LogoutButton from '../components/client/LogoutButton';
import RoomCard from "../components/client/RoomCard";
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
            <>
            <h1>Welcome to ConfBook</h1>
            <h5>Conference Room Booking Website</h5>
            <LoginButton />
            </>
        )
    }
    
    return (

        <>
        <h3>Welcome, {user?.name}</h3>
        <LogoutButton />
        <h2>List of Conference Rooms</h2>
        <form onSubmit={handleSearch}>
            <input type="text" placeholder="Search for specific room..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}></input>
            <button type="submit">Search</button>
        </form>

        {
            rooms.map((room) => room.title.startsWith(searchQuery) && (<RoomCard room={room} key={room._id}/>))
        }

        </>

    )
}

export default Home