import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  userId: number;
  username: string;
  walletAddress: string;
  score: number;
  gameId: number;
  gameName: string;
  rank: number;
}

interface LeaderboardResponse {
  data: LeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: string;
    totalPages: number;
  };
  sortBy: string;
  sortOrder: string;
  gameId: number;
}

interface LeaderboardProps {
  onClose: () => void;
  currentPlayerData?: {
    score: number;
    username: string;
    walletAddress: string;
  };
}

export default function Leaderboard({ onClose, currentPlayerData }: LeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeaderboard = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try multiple CORS proxy options
      const corsProxies = [
        '', // Direct request first
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/'
      ];
      
      let lastError = null;
      
      for (const proxy of corsProxies) {
        try {
          const url = `${proxy}https://monad-games-id-site.vercel.app/api/leaderboard?page=${page}&gameId=135&sortBy=scores&t=${Date.now()}`;
          
          const response = await fetch(url, {
            headers: proxy ? {} : {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          });
          
          if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }
          
          const data: LeaderboardResponse = await response.json();
          setLeaderboardData(data.data);
          setTotalPages(data.pagination.totalPages);
          setCurrentPage(page);
          setLoading(false);
          return; // Success, exit the function
        } catch (err) {
          lastError = err;
          // Continue to next proxy
        }
      }
      
      // If all proxies failed
      throw lastError || new Error('All CORS proxies failed');
      
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(1);
  }, []);

  // Format wallet address for display
  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Determine if the current user is in the leaderboard
  const getCurrentUserRank = () => {
    if (!currentPlayerData) return null;
    
    const userEntry = leaderboardData.find(entry => 
      entry.username === currentPlayerData.username || 
      (currentPlayerData.walletAddress && entry.walletAddress === currentPlayerData.walletAddress)
    );
    
    return userEntry || null;
  };

  const currentUserRank = getCurrentUserRank();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-yellow-600 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-400">Dark Dungeon Leaderboard</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-yellow-400 text-2xl"
          >
            ×
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-yellow-400 text-xl">Loading leaderboard...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-600 rounded p-4 mb-6">
            <div className="text-red-200 font-bold mb-2">Error Loading Leaderboard</div>
            <div className="text-red-300 text-sm mb-2">{error}</div>
            <button
              onClick={() => fetchLeaderboard(1)}
              className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-white text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-yellow-600">
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Player</th>
                    <th className="px-4 py-3 text-right">Score</th>
                    <th className="px-4 py-3 text-left">Wallet</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((entry) => (
                    <tr 
                      key={entry.userId} 
                      className={`border-b border-gray-800 hover:bg-gray-800 ${
                        currentPlayerData && 
                        (entry.username === currentPlayerData.username || 
                         entry.walletAddress === currentPlayerData.walletAddress) 
                          ? 'bg-yellow-900 bg-opacity-30' 
                          : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-bold">
                        <div className="flex items-center">
                          {entry.rank === 1 ? (
                            <span className="text-yellow-400 mr-2">🥇</span>
                          ) : entry.rank === 2 ? (
                            <span className="text-gray-300 mr-2">🥈</span>
                          ) : entry.rank === 3 ? (
                            <span className="text-yellow-700 mr-2">🥉</span>
                          ) : null}
                          #{entry.rank}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm">🎮</span>
                          </div>
                          <span className={entry.rank <= 3 ? 'font-bold text-yellow-400' : ''}>
                            {entry.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {formatWalletAddress(entry.walletAddress)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {currentPlayerData && currentUserRank && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-yellow-600">
                <h3 className="text-yellow-400 font-bold mb-2">Your Position</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-white">Rank: </span>
                    <span className="font-bold text-yellow-400">#{currentUserRank.rank}</span>
                  </div>
                  <div>
                    <span className="text-white">Score: </span>
                    <span className="font-bold text-yellow-400">{currentUserRank.score.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-4">
                <button
                  onClick={() => fetchLeaderboard(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 hover:bg-gray-700 border border-yellow-600"
                >
                  Previous
                </button>
                
                <div className="flex items-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => fetchLeaderboard(page)}
                      className={`px-3 py-1 mx-1 rounded ${
                        currentPage === page 
                          ? 'bg-yellow-600 text-white' 
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => fetchLeaderboard(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 hover:bg-gray-700 border border-yellow-600"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}