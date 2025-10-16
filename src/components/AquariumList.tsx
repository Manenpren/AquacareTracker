import React from 'react';
import { Aquarium } from '../types';
import AquariumCard from './AquariumCard';

interface AquariumListProps {
  aquariums: Aquarium[];
  onDelete: (id: string) => void;
  onClean: (id:string) => void;
  onWaterChange: (id:string) => void;
  onEdit: (aquarium: Aquarium) => void;
}

const AquariumList: React.FC<AquariumListProps> = ({ aquariums, onDelete, onClean, onWaterChange, onEdit }) => {
  if (aquariums.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-gray-300">No aquariums yet!</h2>
        <p className="text-gray-500 mt-2">Click "Add Aquarium" to get started.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {aquariums.map(aquarium => (
        <AquariumCard 
          key={aquarium.id} 
          aquarium={aquarium} 
          onDelete={onDelete}
          onClean={onClean}
          onWaterChange={onWaterChange}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default AquariumList;
