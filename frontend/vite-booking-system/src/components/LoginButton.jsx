import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {

    const {loginWithRedirect, isAuthenticated} = useAuth0();
    
    return (

        !isAuthenticated && (
            <button onClick={() => loginWithRedirect()}
            className="bg-rose-500 text-white font-medium py-2 px-6 rounded-md hover:bg-rose-600 hover:scale-105 transition-all cursor-pointer">
                Login
            </button>
        )
        
    )
}

export default LoginButton