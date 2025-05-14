import { SignIn, SignInButton } from "@clerk/clerk-react";
import './styles/HomeMain.css';
import { useRadialMagnetEffect } from "./effects/useMagnetEffect";
import React from "react";
import logo from '../assets/qonverse-v2.svg';

const HomeMain = () => {
    const magnetRef = useRadialMagnetEffect();
    return (
        <main className="home-main">
            <div>
                <img
                    ref={magnetRef}
                    className="main-logo"
                    src={logo}
                    alt="Qonverse Logo"
                />
            </div>
        </main>
    )
};

export default HomeMain;