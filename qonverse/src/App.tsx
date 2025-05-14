import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import ChatBox from './components/ChatBox';
import Home from './components/Home';
import React from 'react';
import { Chat } from 'openai/resources.mjs';


export default function App() {
 
  return (
    <main>
      <SignedOut>
        <Home />
      </SignedOut>
      <SignedIn>
        <h2>¡Hola! ¿De qué quieres conversar hoy?</h2>
        <ChatBox />
      </SignedIn>
    </main>
  );
}