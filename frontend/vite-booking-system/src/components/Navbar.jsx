import { Link } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import { useState } from "react";

const Navbar = () => {

    const {isAuthenticated} = useAuth0();
    const [open, setOpen] = useState(false);

    return (
        <nav className="flex items-center justify-between w-full relative">
            <Link to="/" className="text-xl font-bold text-rose-400 hover:scale-105 transition-all">ConfBook
            </Link>
            <div className="hidden sm:flex items-center gap-5 font-medium">
                {
                    isAuthenticated && (
                        <>
                        <Link to="/" className="hover:text-rose-400 transition-all">Home</Link>
                        <Link to="/my-bookings" className="hover:text-rose-400 transition-all">My Bookings</Link>
                        <Link to="/dashboard" className="hover:text-rose-400 transition-all">Dashboard</Link>
                        </>
                    )
                }
                {
                    ( isAuthenticated ? <LogoutButton /> : <LoginButton /> )
                }
            </div>
            {/* Mobile menu button */}
            <div className="sm:hidden cursor-pointer text-2xl hover:scale-110 transition-all text-white z-50 w-8 text-right"
            onClick={() => setOpen(!open)}>
                {open ? '✖' : '☰'}
            </div>
            {/* Mobile navbar */}
            {
                open && (
                    <div className="absolute top-[100%] left-[-20px] w-screen bg-slate-900 flex flex-col items-center gap-5 sm:hidden border-t border-slate-700 z-50 py-3">
                        <Link to="/" onClick={() => setOpen(false)} className="hover:text-rose-400 transition-all text-lg">Home</Link>
                        {
                            isAuthenticated && (
                                <>
                                <Link to="/my-bookings" onClick={() => setOpen(false)}
                                className="hover:text-rose-400 transition-all text-lg">My Bookings</Link>
                                <Link to="/dashboard" onClick={() => setOpen(false)}
                                className="hover:text-rose-400 transition-all text-lg">Dashboard</Link>
                                </>
                            )
                        }
                        <div onClick={() => setOpen(false)}>
                            {isAuthenticated ? <LogoutButton /> : <LoginButton />}
                        </div>
                    </div>
                )
            }


        </nav>
    )
}

export default Navbar