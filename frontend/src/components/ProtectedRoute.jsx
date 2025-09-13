import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
    const [auth, setAuth] = useState(null); // null = loading, true/false = checked

    useEffect(() => {
        let mounted = true;
        isAuthenticated().then(result => {
            if (mounted) setAuth(result);
        });
        return () => { mounted = false; };
    }, []);

    if (auth === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-blue-600 text-xl font-semibold animate-pulse">Checking authentication...</div>
            </div>
        );
    }
    if (!auth) {
        return <Navigate to='/login' replace />;
    }
    return children;
}

export default ProtectedRoute;