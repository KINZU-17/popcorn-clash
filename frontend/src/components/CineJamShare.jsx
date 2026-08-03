import React, { useMemo } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { Share2 } from 'lucide-react';

/**
 * A component to display a sharable link and QR code for a lobby.
 * @param {{ lobbyId: string }} props
 */
export function CineJamShare({ lobbyId }) {
  const shareUrl = useMemo(() => {
    // Use the production URL for sharing, even from localhost
    const baseUrl = "https://popcorn-clash-neon.vercel.app";
    return `${baseUrl}/match/${lobbyId}`;
  }, [lobbyId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    // You can add a toast notification here to confirm the copy
    alert('Link copied to clipboard!');
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
      <h3 className="text-lg font-bold text-yellow-400 mb-3">Share this Jam!</h3>
      <div className="flex justify-center mb-4">
        <QRCode
          value={shareUrl}
          size={128}
          bgColor="#ffffff"
          fgColor="#111827"
          logoImage="/popcorn-logo.png" // Make sure you have a logo in your public folder
          logoWidth={40}
          logoHeight={40}
          qrStyle="squares"
        />
      </div>
      <div className="flex items-center bg-gray-900 rounded-md p-2">
        <input
          type="text"
          value={shareUrl}
          readOnly
          className="bg-transparent text-gray-300 text-sm w-full outline-none"
        />
        <button onClick={copyToClipboard} className="ml-2 p-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-gray-900">
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
}