import React, {useState,useContext} from "react";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "../context/AuthContext";



const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')
    const [error , setError] = useState('')
    const {login}= useContext(AuthContext)
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault()
        try{
            await login(email,password)
            navigate('/dashboard')

        }catch (err) {
            setError(err.message)
        }

        return (
            <div className="card p-4">
                <h2>Login</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
            </div>
        )
    }

}




export default Login;