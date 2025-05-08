import React, {useContext, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import {AuthContext} from "../context/AuthContext";

const Navbar = () => {
    const {user,logout} = useContext(AuthContext);
    const navigate= useNavigate();
    useEffect(()=>{console.log("user is ", user)},[])
    const handleLogout = () => {
        logout();
        navigate('/login')

        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <Link className="navbar-brand" to="/">TaskSync</Link>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav ml-auto">
                        {user? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/dashboard">DashBoard</Link>
                                </li>
                                <li className="nav-item">
                                    <button className=" nav-link btn btn-link" onClick={handleLogout}>Logout</button>
                                </li>


                            </>
                        ): (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Login</Link>

                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">Register</Link>

                                </li>

                            </>

                        )}
                    </ul>
                </div>
            </nav>

        );

    }
}

export default Navbar;
