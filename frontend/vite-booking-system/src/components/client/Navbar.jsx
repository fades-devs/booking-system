import { Link } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";

const Navbar = () => {

    const {isAuthenticated} = useAuth0();

    return (
        <>
        <Link to="/">Home</Link>
        <Link to="/my-bookings">My Bookings</Link>
        {
            ( isAuthenticated ? <LogoutButton /> : <LoginButton /> )
        }
        </>
    )
}

export default Navbar