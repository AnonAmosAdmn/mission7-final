"use client";
import { useState, useRef } from "react";
import DarkDungeon from "./components/DarkDungeon";
import AuthComponent from "./components/AuthComponent";
import ScoreDebugger from "./components/ScoreDebugger";
import Link from "next/link";
import Image from "next/image";
import Leaderboard from "./components/Leaderboard";

export default function Home() {
  const [playerAddress, setPlayerAddress] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch((err) => {
        console.log("Could not play audio:", err);
      });
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">

      <audio ref={audioRef} src="/background_music.mp3" loop />

      {!playerAddress && <Image src="/logo.png" alt="Dark Dungeon Logo" width={900} height={600} />}
      {!playerAddress && <AuthComponent onAddressChange={setPlayerAddress} />}

      <div className="fixed bottom-4 flex flex-row items-center gap-x-2">
        {playerAddress && 
          <button
            onClick={toggleMusic}
            className={`mt-4 px-6 py-3 rounded-lg shadow transition ${
              isPlaying ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            } text-white`}
          >
            {isPlaying ? "⏸" : "🎵"}
          </button>
        }
        {playerAddress && <AuthComponent onAddressChange={setPlayerAddress} />}
      </div>

      {playerAddress && (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
          <button
            onClick={() => setShowLeaderboard(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Leaderboard
          </button>
        </div>
      )}

      {showLeaderboard && (
        <Leaderboard 
          onClose={() => setShowLeaderboard(false)}
          // Without score tracking, just show the wallet address
          currentPlayerData={playerAddress ? {
            score: 0,
            username: playerAddress.slice(0, 8), // Shortened address as username
            walletAddress: playerAddress
          } : undefined}
        />
      )}

      {playerAddress && <DarkDungeon username={playerAddress} />}

      {playerAddress && <ScoreDebugger playerAddress={playerAddress} />}

    </div>
  );
}
