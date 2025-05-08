import React, {useEffect, useState, createContext} from "react";
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

export const  AuthContext = createContext();


export  const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || null);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || null);
    const navigate = useNavigate();

    useEffect(() => {
        if (accessToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            console.log(axios.defaults.headers.common['Authorization']);
            axios.get('http://localhost:8080/api/users/me')
                .then(response => {
                    setUser(response.data)
                })
                .catch(
                    () => logout()
                )
        }
    },[accessToken]);

    const login = async (email, password) => {
        try{
            const response = await axios.post('http://localhost:8080/api/auth/login', {email,password});
            const {accessToken,refreshToken} = response.data;
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken',refreshToken);// test this by rewriting it again and see the popups
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            const userResponse = await  axios.get('http://localhost:8080/api/users/me');
            setUser(userResponse.data)
            navigate('/dashboard');
        }catch (error){
            throw new Error(error.response?.data?.message || 'Login failed')
        }
    }

    const register = async (firstName, lastName, email , password, role) => {
       try {
        const response =await axios.post('http://localhost:8080/api/auth/login',{
            firstName,
            lastName,
            email,
            password,
            role
        });
        console.log('Registration response:', response.data);
        const accessToken = response.data.accessToken;
        const refreshToken = response.data.refreshToken;

        console.log('Extracted tokens:', { accessToken, refreshToken });

        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken); // Test this too like in login
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        console.log('Authorization header set:', axios.defaults.headers.common['Authorization']);
        const userResponse = await axios.get('http://localhost:8080/api/users/me');
        console.log('User response:', userResponse.data);
        setUser(userResponse.data);
        navigate('/dashboard');


       }catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Registration failed');
    }

    const refreshAccessToken = async () => {
           try {
               const response = await axios.post('http://localhost:8080/api/auth/refresh-token',{},{headers: {Authorization: `Bearer ${refreshToken}`}})
               const {accessToken,refreshToken:newRefreshToken}= response.data;
               console.log('Extracted tokens:', { accessToken, refreshToken });
               setAccessToken(accessToken);
               setRefreshToken(newRefreshToken);
               localStorage.setItem('accessToken',accessToken);
               localStorage.setItem('refreshToken',newRefreshToken)
               axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
               return accessToken;
           }catch (error) {
               logout();
               throw new Error('Session expired, please log in again')
           }
           }
    }

    const logout = () => {
        setUser(null)
        setAccessToken(null)
        setRefreshToken(null)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    // // Axios interceptor to handle 401 errors
    // useEffect(() => {
    //     const interceptor = axios.interceptors.response.use(
    //         response => response,
    //         async error => {
    //             if (error.response?.status === 401 && refreshToken) {
    //                 try {
    //                     await refreshAccessToken;
    //                     // Retry the original request
    //                     return axios(error.config);
    //                 } catch (refreshError) {
    //                     logout();
    //                     return Promise.reject(refreshError);
    //                 }
    //             }
    //             return Promise.reject(error);
    //         }
    //     );
    //     return () => axios.interceptors.response.eject(interceptor);
    // }, [refreshToken]);

    return (
        <AuthContext.Provider value={{user,accessToken,refreshToken,login,register,logout}}>
            {children}
        </AuthContext.Provider>
    );
};
