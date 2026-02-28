import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {

    const {user, isAuthenticated} = useAuth0();
    
    return (

        isAuthenticated && (
            <div>
                <h2>Welcome! {user?.name}</h2>
                <p>
                    {user?.picture && <img src={user.picture} alt={user?.name} />}
                </p>
            </div>
        )
        
    )
}

export default Profile