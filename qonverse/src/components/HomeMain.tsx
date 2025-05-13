import { SignIn, SignInButton } from "@clerk/clerk-react";
import './HomeMain.css';
import { useRadialMagnetEffect } from "./effects/useMagnetEffect";
import React from "react";

const HomeMain = () => {
    const magnetRef = useRadialMagnetEffect();
    return (
        <main className="home-main">
            <div><p ref={magnetRef} className="main-logo">Hola</p></div>
        </main>
    )
};

export default HomeMain;