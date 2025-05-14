import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import Home from './components/Home';
import React, {useEffect} from 'react';
import ChatBox from './components/ChatBox';
import FirestoreTest from './components/FirestoreTest';

export default function App() {
  return (
    <main>
      <SignedOut>
        <Home />
      </SignedOut>
      <SignedIn>
        <FirestoreTest />
      </SignedIn>
    </main>
  );
}