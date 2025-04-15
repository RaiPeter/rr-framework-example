import React from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "./store";
import { logout } from "./reducers/userReducer";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/signin");
  };

  return (
    <nav>
      <div className="logo">
        <h1 onClick={() => navigate("/forums")}>Forum</h1>
      </div>
      <div className="links">
        <Link to={"/forums/history"}>
          {isAuthenticated ? user?.username : ""}
        </Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
