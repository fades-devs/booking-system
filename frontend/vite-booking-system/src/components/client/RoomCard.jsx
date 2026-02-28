import axios from "axios";

import { useAuth0 } from "@auth0/auth0-react";

const RoomCard = ({room}) => {

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

    return (
        <div>
            <p>------------------</p>
            <p>{room.title}</p>
            <p>{room.capacity}</p>
            <p>{room.basePrice}</p>
            <p>{room.location}</p>
            <button onClick={handleBooking}>Book Room</button>
            <p>------------------</p>
        </div>
    )
}


export default RoomCard