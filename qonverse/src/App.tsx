import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import RoleSelectionModal from './components/RoleModal';
import Home from './components/Home';
import React from 'react';
import { Chat } from 'openai/resources.mjs';
import ChatBox from './components/ChatBox';

export default function App() {


  return (
    <main>
      <SignedOut>
        <Home />
      </SignedOut>
      <SignedIn>
        <ChatBox />
      </SignedIn>
    </main>
  );
}