"use client";

import { signIn } from "next-auth/react";
import React from "react";

const handleSignIn = () => {
    signIn('spotify', { callbackUrl: "/" });
};

const Login = () => {
    return (
        <div className='flex items-center justify-center'>
            <button onClick={handleSignIn}>Login with Spotify</button>

        </div>
    );
};

export default Login;