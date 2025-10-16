import React from 'react';
import { PlusIcon } from './Icons';

interface HeaderProps {
  onAddAquarium: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddAquarium }) => {
  return (
    <header className="bg-gray-800 text-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
      <h1 className="text-2xl font-bold font-['Poppins']">AquaCare Tracker</h1>
      <button
        onClick={onAddAquarium}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full flex items-center transition-colors"
        aria-label="Add new aquarium"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Add Aquarium
      </button>
    </header>
  );
};

export default Header;
