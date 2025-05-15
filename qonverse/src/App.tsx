import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import Home from './components/Home';
import React, {useEffect} from 'react';
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