import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
  const { logout, isAuthenticated } = useAuth0();

  return (
    isAuthenticated && (
      <button
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
        className="bg-slate-600 text-white font-medium py-2 px-6 rounded-md shadow-sm hover:bg-slate-600 hover:scale-105 transition-all cursor-pointer"
      >
        Log Out
      </button>
    )
  );
};

export default LogoutButton;
