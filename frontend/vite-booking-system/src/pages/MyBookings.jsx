import { useAuth0 } from "@auth0/auth0-react"

import Booking from '../components/client/Booking'
import { useEffect, useState } from "react";
import axios from "axios";


const MyBookings = () => {

    const {getAccessTokenSilently, isAuthenticated} = useAuth0();
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const getBookings = async () => {

            try {
                const token = await getAccessTokenSilently();
                const response = await axios.get(`http://localhost:3002/api/v1/bookings/by-client`,
                    {
                        headers: {Authorization: `Bearer ${token}`}
                    }
            )
            setBookings(response.data)
            } catch (err) {
                setError(err);
                console.log('Failed to get bookings:', err)
            } finally {
                setLoading(false)
            }
            
        }

        getBookings()

    }, []);


    if (!isAuthenticated) {
        return (
            <>
            <p>You must be authenticated to view this page.</p>
            </>
        )
    }

    return (
        <>
        <h1>My Bookings</h1>
        {
            bookings.map((booking) => <Booking booking={booking} key={booking._id}/>)
        }

        </>
    )
}

export default MyBookings