import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Home from './components/Home';
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