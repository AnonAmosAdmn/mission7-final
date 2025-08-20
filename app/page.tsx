

"use client";
import { useState } from 'react';
import DarkDungeon from './components/DarkDungeon';
import AuthComponent from './components/AuthComponent';
import ScoreDebugger from './components/ScoreDebugger';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [playerAddress, setPlayerAddress] = useState<string>("");

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">
      <AuthComponent onAddressChange={setPlayerAddress} />
      <Link href="https://monad-games-id-site.vercel.app/leaderboard?page=1&gameId=21" className="btn">
        View Leaderboard
      </Link>
      {!playerAddress && <Image src="/logo.png" alt="Dark Dungeon Logo" width={300} height={200} />}
      {playerAddress && <DarkDungeon username={playerAddress} />}
      {playerAddress && <ScoreDebugger playerAddress={playerAddress} />}
    </div>
  );
}