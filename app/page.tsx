"use client";
import { useState, useRef } from "react";
import DarkDungeon from "./components/DarkDungeon";
import AuthComponent from "./components/AuthComponent";
import ScoreDebugger from "./components/ScoreDebugger";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [playerAddress, setPlayerAddress] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playMusic = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5; // adjust volume
      audioRef.current.play().catch((err) => {
        console.log("Could not play audio:", err);
      });
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">
      {/* Background Music */}
      <audio ref={audioRef} src="/background_music.mp3" loop />

      {/* Play Button */}
      <button
        onClick={playMusic}
        className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
      >
        🎵 Play Music
      </button>

      <Image src="/logo.png" alt="Dark Dungeon Logo" width={300} height={200} />
      <AuthComponent onAddressChange={setPlayerAddress} />

      {playerAddress && (
        <div className="fixed bottom-4 left-4 z-50">
          <Link
            href="https://monad-games-id-site.vercel.app/leaderboard?page=1&gameId=21"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Leaderboard
          </Link>
        </div>
      )}

      {playerAddress && <DarkDungeon username={playerAddress} />}
      {playerAddress && <ScoreDebugger playerAddress={playerAddress} />}
    </div>
  );
}
