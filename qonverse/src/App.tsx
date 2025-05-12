import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

export default function App() {
  return (
    <main>
      <header>
        <h1>Qonverse</h1>
        <nav>
          <SignedOut>
            <SignInButton mode='modal' />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>
      </header>
      <SignedIn>
        <h2>¿De qué quieres conversar hoy?</h2>
      </SignedIn>
    </main>
  );
}