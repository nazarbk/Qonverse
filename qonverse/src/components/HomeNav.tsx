import { SignIn, SignInButton } from "@clerk/clerk-react";
import './HomeNav.css';
import React from "react";

const HomeNav = () => {

    return (
        <header className="home-nav">
            <div className="home-nav-1">
                <a>Quienes somos</a>
                <a>Sobre nosotros</a>
            </div>
            <div className="home-nav-2">
                <SignInButton mode="modal" /> 
            </div>
        </header>
    )
};

export default HomeNav;