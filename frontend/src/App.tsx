import { useState } from "react";

function App() {
  const [symbol, setSymbol] = useState("ETHUSDT");
  const [interval, setInterval] = useState("5m");

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      {/* ===== TOP NAVBAR ===== */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-900">
        <div className="text-lg font-bold">Exness Clone</div>
        <nav className="flex gap-6 text-sm text-gray-300">
          <button className="hover:text-white">Markets</button>
          <button className="hover:text-white">Trade</button>
          <button className="hover:text-white">Wallet</button>
          <button className="hover:text-white">Profile</button>
        </nav>
      </header>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* === LEFT SIDEBAR === */}
        <aside className="w-64 border-r border-gray-800 bg-gray-900 p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-2">Markets</h2>
          <ul className="space-y-2">
            <li className="cursor-pointer hover:text-yellow-400">BTCUSDT</li>
            <li className="cursor-pointer hover:text-yellow-400">ETHUSDT</li>
            <li className="cursor-pointer hover:text-yellow-400">SOLUSDT</li>
            <li className="cursor-pointer hover:text-yellow-400">XRPUSDT</li>
          </ul>
        </aside>

        {/* === CENTER: CHART + CONTROLS === */}
        <main className="flex-1 flex flex-col">
          {/* Chart controls */}
          <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-800 bg-gray-900">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="bg-gray-800 px-3 py-1 rounded text-sm"
            />
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="bg-gray-800 px-3 py-1 rounded text-sm"
            >
              <option value="5m">5m</option>
              <option value="30m">30m</option>
              <option value="1h">1h</option>
              <option value="1d">1d</option>
            </select>
            <button className="bg-yellow-500 text-black px-4 py-1 rounded text-sm font-semibold">
              Trade
            </button>
          </div>

          {/* Chart area */}
         
        </main>

        {/* === RIGHT SIDEBAR: ORDER BOOK === */}
        <aside className="w-80 border-l border-gray-800 bg-gray-900 flex flex-col">
          <div className="p-2 border-b border-gray-800 text-sm font-semibold">
            Order Book
          </div>
          <div className="flex-1 overflow-y-auto text-xs p-2 space-y-1">
            {/* Placeholder rows */}
            <div className="flex justify-between text-red-400">
              <span>4339.50</span> <span>2.34</span>
            </div>
            <div className="flex justify-between text-green-400">
              <span>4338.20</span> <span>5.12</span>
            </div>
          </div>
        </aside>
      </div>

      {/* ===== BOTTOM PANEL ===== */}
      <footer className="h-40 border-t border-gray-800 bg-gray-900 p-4 overflow-y-auto">
        <h2 className="text-sm font-semibold mb-2">Open Positions</h2>
        <table className="w-full text-xs text-gray-300">
          <thead>
            <tr className="text-left border-b border-gray-700">
              <th>Symbol</th>
              <th>Side</th>
              <th>Size</th>
              <th>Entry</th>
              <th>Mark</th>
              <th>PnL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ETHUSDT</td>
              <td className="text-green-400">LONG</td>
              <td>0.5</td>
              <td>4320.00</td>
              <td>4338.00</td>
              <td className="text-green-400">+9.0%</td>
            </tr>
          </tbody>
        </table>
      </footer>
    </div>
  );
}

export default App;
