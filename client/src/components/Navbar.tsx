import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="p-4 flex gap-4 bg-gray-100">
      <Link to="/">Home </Link>
      <Link to="/admin">Admin </Link>
      <Link to="/commander">Commander </Link>
      <Link to="/operator">Operator </Link>
      <Link to="/observer">Observer </Link>
    </nav>
  );
};

export default Navbar;
