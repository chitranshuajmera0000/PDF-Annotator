import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setToken, isAuthenticated } from "../utils/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useEffect } from "react";





const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        // If already logged in, redirect to /library
        isAuthenticated().then(auth => {
            if (auth) navigate('/library');
        });
    }, [navigate])


    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error])


    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:5000/api/auth/login',
                { email, password }
            );
            if (res.status === 200) {
                setToken(res.data.token);
                setLoading(false);
                setError('');
                navigate('/library');
            }
            else {
                setLoading(false);
                setError(err.response?.data?.message || 'Login Failed');
            }
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Login Failed');
        }
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
            <div className="bg-white/90 shadow-2xl rounded-2xl px-10 py-10 w-full max-w-md flex flex-col items-center">
                <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-6 drop-shadow">Welcome Back</h2>
                {error && <div className="flex justify-center mb-4 text-red-500 items-center bg-red-100 h-8 rounded-lg w-full">{error}</div>}
                <form onSubmit={handleLogin} className="space-y-5 w-full">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
                    />
                    <div className="relative w-full">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10 bg-blue-50"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-gray-500"
                            onClick={() => setShowPassword((prev) => !prev)}
                            tabIndex={-1}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="w-full cursor-pointer py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition duration-200 shadow-md"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-600">
                    Don&apos;t have an account?{" "}
                    <a href="/signup" className="text-blue-600 hover:underline font-medium">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    )
}

export default Login;