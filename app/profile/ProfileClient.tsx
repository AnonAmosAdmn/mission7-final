'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type StatsResp =
  | {
      ok: true;
      total?: { score: string; transactions: string };
      game?: { score: string; transactions: string; gameAddress: string };
    }
  | { ok: false; error?: string };

type EventRow = {
  blockNumber: string;
  txHash: string;
  game: string;
  player: string;
  scoreAmount: string;
  transactionAmount: string;
};

type EventsResp =
  | { ok: true; rows: EventRow[]; fromBlock?: string; toBlock?: string }
  | { ok: false; error?: string };

export default function ProfileClient() {
  const params = useSearchParams();
  const router = useRouter();

  const addressParam = params.get('address') ?? '';
  const address = addressParam.toLowerCase() as `0x${string}`;
  const walletLooksValid = /^0x[a-fA-F0-9]{40}$/.test(address);

  const [stats, setStats] = useState<StatsResp | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [err, setErr] = useState<string | null>(null);


  const loadStats = useCallback(async () => {
    if (!walletLooksValid) return;
    setLoadingStats(true);
    setErr(null);
    try {
      const r = await fetch(`/api/get-stats?player=${address}`, { cache: 'no-store' });
      if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
      const data: StatsResp = await r.json();
      if (!data.ok) throw new Error(data.error || 'Failed to load stats');
      setStats(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : typeof e === 'string' ? e : 'unknown';
      setErr(`Failed to consult the ancient records: ${msg}`);
    } finally {
      setLoadingStats(false);
    }
  }, [address, walletLooksValid]);

  const loadEvents = useCallback(async () => {
    if (!walletLooksValid) return;
    setLoadingEvents(true);
    setErr(null);
    try {
      const r = await fetch(`/api/player/events?player=${address}&limit=50&range=10000`, { 
        cache: 'no-store' 
      });
      if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
      const data: EventsResp = await r.json();
      if (!data.ok) throw new Error(data.error || 'Failed to load events');
      setEvents(data.rows);
    } catch (e) {
      const msg = e instanceof Error ? e.message : typeof e === 'string' ? e : 'unknown';
      setErr(`Failed to decipher the runestones: ${msg}`);
    } finally {
      setLoadingEvents(false);
    }
  }, [address, walletLooksValid]);

  useEffect(() => {
    if (walletLooksValid) {
      loadStats();
      loadEvents();
    }
  }, [walletLooksValid, loadStats, loadEvents]);

  if (!walletLooksValid) {
    return (
      <main className="profile-container">
        <div className="panel">
          <h1 className="profile-title">Adventurers Scroll</h1>
          <div className="error">
            <span className="icon">🔍</span> Invalid or missing wallet address in the archives.
          </div>
          <button className="btn" onClick={() => router.push('/')}>
            <span className="icon">🏰</span> Return to the Keep
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-container">
      {/* Header */}
      <div className="panel profile-header">
        <div className="header-content">
          <div>
            <h1 className="profile-title">Adventurers Chronicle</h1>
            <div className="wallet-display">
              <span className="wallet-label">Scroll of:</span>
              <code className="mono wallet-address">{address}</code>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn"
              onClick={() => router.push(`/leaderboard?scope=game&highlight=${address}`)}
            >
              <span className="icon">🏆</span> Hall of Champions
            </button>
            <button className="btn" onClick={() => router.push('/')}>
              <span className="icon">🏰</span> Back to Dungeon
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="panel stats-panel">
        <div className="panel-title">
          <span className="icon">📜</span> Adventurers Tome
        </div>
        {loadingStats ? (
          <div className="loading-message">
            <span className="spinner">🔮</span> Consulting the ancient records...
          </div>
        ) : stats && 'ok' in stats && stats.ok ? (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Gold</div>
              <div className="stat-value">
                {stats.total?.score ?? '0'} <span className="coin">🪙</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Quests Completed</div>
              <div className="stat-value">
                {stats.total?.transactions ?? '0'} <span className="quest-icon">🗡️</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">This Dungeon Gold</div>
              <div className="stat-value">
                {stats.game?.score ?? '0'} <span className="coin">🪙</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Dungeon Quests</div>
              <div className="stat-value">
                {stats.game?.transactions ?? '0'} <span className="quest-icon">🛡️</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="error">
            <span className="icon">💀</span> Failed to read the tome: {(stats as { error?: string })?.error ?? 'Unknown error'}
          </div>
        )}
      </div>


      {/* Recent events */}
      <div className="panel events-panel">
        <div className="panel-title">
          <span className="icon">⚔️</span> Recent Adventures
        </div>
        {loadingEvents ? (
          <div className="loading-message">
            <span className="spinner">🔮</span> Gathering tales from the bards...
          </div>
        ) : events.length === 0 ? (
          <div className="empty-message">
            The scribes have no tales of your adventures yet...
          </div>
        ) : (
          <div className="table-wrap">
            <table className="events-table">
              <colgroup>
                <col className="era-col" />
                <col className="scroll-col" />
                <col className="gold-col" />
                <col className="quest-col" />
              </colgroup>
              <thead>
                <tr>
                  <th className="era-header">Era</th>
                  <th className="scroll-header">Scroll ID</th>
                  <th className="gold-header">Gold Earned</th>
                  <th className="quest-header">Quests</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.txHash}>
                    <td className="mono era-cell">{ev.blockNumber}</td>
                    <td className="mono scroll-cell" title={ev.txHash}>
                      {short(ev.txHash)}
                    </td>
                    <td className="gold-cell">
                      <div className="gold-content">
                        <b>{Number(ev.scoreAmount).toLocaleString('tr-TR')}</b>
                        <span className="coin">🪙</span>
                      </div>
                    </td>
                    <td className="quest-cell">
                      <div className="quest-content">
                        {Number(ev.transactionAmount).toLocaleString('tr-TR')}
                        <span className="quest-icon">🗡️</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {err && <div className="error">{err}</div>}
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px;
          background: url('/images/dungeon-bg.jpg') no-repeat center center fixed;
          background-size: cover;
          color: #e0d6ff;
          font-family: 'MedievalSharp', cursive;
        }

        .panel {
          background: rgba(20, 12, 36, 0.8);
          border: 1px solid #3a2a5f;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          backdrop-filter: blur(4px);
        }

        .profile-header {
          border-bottom: 2px solid #4a3a6a;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .profile-title {
          margin: 0;
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(to right, #d4af37, #f9d423, #d4af37);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          letter-spacing: 1px;
        }

        .wallet-display {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .wallet-label {
          font-size: 14px;
          color: #b8a2e6;
        }

        .wallet-address {
          font-size: 14px;
          color: #e0d6ff;
          background: rgba(58, 42, 95, 0.5);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(to bottom, #4a3a6a, #3a2a5a);
          color: #e0d6ff;
          border: 1px solid #5d4a7a;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
          font-family: 'MedievalSharp', cursive;
        }

        .btn:hover {
          background: linear-gradient(to bottom, #5d4a7a, #4a3a6a);
          transform: translateY(-1px);
        }

        .btn:active {
          transform: translateY(0);
        }

        .icon {
          font-size: 18px;
        }

        .panel-title {
          font-size: 20px;
          font-weight: 800;
          color: #d4af37;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stats-panel {
          background: rgba(30, 20, 50, 0.7);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .stat-card {
          background: rgba(40, 30, 60, 0.7);
          border: 1px solid #4a3a6a;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }

        .stat-label {
          font-size: 14px;
          color: #b8a2e6;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 800;
          color: #f9d423;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .coin, .quest-icon {
          font-size: 20px;
        }

        .events-panel {
          background: rgba(30, 20, 50, 0.7);
        }

        .table-wrap {
          overflow: auto;
          border-radius: 6px;
        }

        .events-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: separate;
          border-spacing: 0 8px;
        }

        /* Column width definitions */
        .era-col { width: 15%; min-width: 100px; }
        .scroll-col { width: 35%; min-width: 200px; }
        .gold-col { width: 25%; min-width: 120px; }
        .quest-col { width: 25%; min-width: 120px; }

        .events-table thead th {
          font-size: 14px;
          color: #d4af37;
          font-weight: 800;
          padding: 12px 16px;
          background: rgba(58, 42, 95, 0.7);
          border-bottom: 2px solid #3a2a5f;
          text-align: center;
        }

        .events-table tbody td {
          background: rgba(40, 30, 60, 0.7);
          padding: 14px 16px;
          color: #e0d6ff;
          font-weight: 600;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .events-table tbody tr td:first-child {
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          border-top-left-radius: 6px;
          border-bottom-left-radius: 6px;
        }

        .events-table tbody tr td:last-child {
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          border-top-right-radius: 6px;
          border-bottom-right-radius: 6px;
        }

        .era-cell {
          text-align: center;
          padding: 12px 16px;
        }

        .scroll-cell {
          text-align: center;
          padding: 12px 16px;
        }

        .gold-cell, .quest-cell {
          text-align: center;
          padding: 12px 16px;
        }

        .gold-content, .quest-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
        }

        .events-table tbody td {
          background: rgba(40, 30, 60, 0.7);
          color: #e0d6ff;
          font-weight: 600;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .gold-cell {
          color: #f9d423;
          font-weight: 800;
        }

        /* Rounded corners */
        .events-table tbody tr td:first-child {
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          border-top-left-radius: 6px;
          border-bottom-left-radius: 6px;
        }

        .events-table tbody tr td:last-child {
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          border-top-right-radius: 6px;
          border-bottom-right-radius: 6px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .era-col { width: 20%; }
          .scroll-col { width: 30%; }
          .gold-col, .quest-col { width: 25%; }
        }

        @media (max-width: 576px) {
          .table-wrap {
            overflow-x: auto;
          }
          .era-col { min-width: 80px; }
          .scroll-col { min-width: 150px; }
          .gold-col, .quest-col { min-width: 100px; }
        }

        .loading-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 0;
          color: #b8a2e6;
          font-size: 16px;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        .empty-message {
          padding: 30px 0;
          text-align: center;
          color: #7a6a9a;
          font-style: italic;
          font-size: 16px;
        }

        .error {
          margin-top: 16px;
          padding: 12px;
          border-radius: 6px;
          background: rgba(168, 28, 56, 0.3);
          color: #ff9e9e;
          border: 1px solid rgba(244, 63, 94, 0.35);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
            flex-direction: column;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}

function short(v: string) {
  return v ? `${v.slice(0, 8)}…${v.slice(-6)}` : '';
}