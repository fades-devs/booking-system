import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {

    const {user, isAuthenticated} = useAuth0();
    
    return (

        isAuthenticated && (
            <div>
                <p>
                    {user?.picture && <img src={user.picture} alt={user?.name} />}
                </p>
                <h2>{user?.name}</h2>
            </div>
        )
        
    )
}

export default Profile