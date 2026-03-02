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
        <>
        <h2>{booking.roomName}</h2>
        <p>{booking.finalPrice}</p>
        <p>{booking.createdAt.split('T')[0]}</p>
        <p>{booking.status}</p>
        <button onClick={handleCancel}>Cancel</button>
        </>
    )

}

export default Booking