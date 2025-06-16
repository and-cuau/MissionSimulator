import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, setUser } = useAuth();

  function logout() {
    setUser(null);
  }

  return (
    <nav className="p-4 flex gap-4 bg-gray-100">
      <Link to="/">Home </Link>
      <Link to="/admin">Admin </Link>
      {/* <Link to="/commander">Commander </Link> */}
      <Link to="/operator">Operator </Link>
      <Link to="/observer">Observer </Link>

      <button
        onClick={() => logout()}
        style={{
          color: user ? "red" : "gray",
          backgroundColor: "transparent",
          cursor: user ? "pointer" : "not-allowed",
        }}
      >
        Log out
      </button>
    </nav>
  );
};

export default Navbar;

const styles = {
  button: {
    width: "70px",
    height: "30px",
    padding: "0px 5px 0px  5px",
    backgroundColor: "transparent",
  },
};
