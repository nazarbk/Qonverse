import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import RoleSelectionModal from './components/RoleModal';
import Home from './components/Home';
import React from 'react';

export default function App() {


  return (
    <main>
      <SignedOut>
        <Home />
      </SignedOut>
      <SignedIn>
        <h2>¿De qué quieres conversar hoy?</h2>
      </SignedIn>
    </main>
  );
}