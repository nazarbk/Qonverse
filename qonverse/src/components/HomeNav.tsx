import { SignIn, SignInButton } from "@clerk/clerk-react";
<<<<<<< HEAD
import './HomeNav.css';
=======
import './styles/HomeNav.css';
>>>>>>> FrontEnd-Branch
import React from "react";

const HomeNav = () => {

    return (
        <header className="home-nav">
            <div className="home-nav-1">
<<<<<<< HEAD
                <a>Quienes somos</a>
                <a>Sobre nosotros</a>
            </div>
            <div className="home-nav-2">
                <SignInButton mode="modal" /> 
=======
                <a href="https://github.com/midudev/hackaton-clerk-2025?tab=readme-ov-file#%EF%B8%8F-c%C3%B3mo-participar-en-la-hackat%C3%B3n" target="_blank">
                    Hackaton 2025
                </a>
                <a href="https://github.com/nazarbk/Qonverse" target="_blank">
                    Repositorio
                </a>
            </div>
            <div className="home-nav-2">
                <SignInButton mode="modal">Iniciar sesión</SignInButton>
>>>>>>> FrontEnd-Branch
            </div>
        </header>
    )
};

export default HomeNav;