'use client';

import { FiMenu } from 'react-icons/fi';

interface TopBarProps {
  onMenuToggle: () => void;
  title?: string;
}

export default function TopBar({ onMenuToggle, title }: TopBarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 sticky top-0 z-30">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mr-3"
      >
        <FiMenu className="w-5 h-5" />
      </button>
      {title && (
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      )}
      <div className="flex-1" />
    </header>
  );
}
