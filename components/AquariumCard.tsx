import React from 'react';
import { Aquarium } from '../types';
import { CalendarIcon, WaterDropIcon, TrashIcon, CheckIcon, FilterIcon, PlantIcon, IconMap } from './Icons';

interface AquariumCardProps {
  aquarium: Aquarium;
  onDelete: (id: string) => void;
  onClean: (id:string) => void;
  onWaterChange: (id:string) => void;
  onEdit: (aquarium: Aquarium) => void;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
    });
};

const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const futureDate = new Date(dateString);
    futureDate.setHours(0,0,0,0);
    const diffTime = futureDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const getStatus = (days: number): { text: string; color: string; } => {
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, color: 'bg-red-500' };
    if (days === 0) return { text: 'Due today', color: 'bg-yellow-500' };
    return { text: `In ${days} days`, color: 'bg-green-500' };
};

const AquariumCard: React.FC<AquariumCardProps> = ({ aquarium, onDelete, onClean, onWaterChange, onEdit }) => {
    const cleaningDaysRemaining = getDaysRemaining(aquarium.nextCleaning);
    const waterChangeDaysRemaining = getDaysRemaining(aquarium.nextPartialWaterChange);

    const cleaningStatus = getStatus(cleaningDaysRemaining);
    const waterChangeStatus = getStatus(waterChangeDaysRemaining);
    
    const CurrentIcon = IconMap[aquarium.icon] || IconMap['aquarium'];

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col transition-transform hover:scale-[1.02]">
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full flex-shrink-0" style={{ backgroundColor: aquarium.iconColor, color: 'white' }}>
                            <CurrentIcon className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white cursor-pointer" onClick={() => onEdit(aquarium)}>{aquarium.name}</h3>
                            <p className="text-sm text-gray-400">{aquarium.capacity}L &bull; {aquarium.fishSpecies}</p>
                        </div>
                    </div>
                    <button onClick={() => onDelete(aquarium.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>

                 <div className="mt-4 flex items-center justify-center gap-4 text-gray-300">
                    {aquarium.hasFilter && <div className="flex items-center gap-1 text-sm"><FilterIcon className="h-4 w-4 text-blue-400" /> Filtered</div>}
                    {aquarium.hasPlants && <div className="flex items-center gap-1 text-sm"><PlantIcon className="h-4 w-4 text-green-400" /> Planted</div>}
                </div>

                <div className="mt-6 space-y-4">
                    {/* Full Cleaning */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="h-6 w-6 text-blue-400" />
                            <div>
                                <p className="font-semibold text-white">Full Cleaning</p>
                                <p className="text-sm text-gray-400">Next: {formatDate(aquarium.nextCleaning)}</p>
                            </div>
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded-full text-white ${cleaningStatus.color}`}>
                            {cleaningStatus.text}
                        </div>
                    </div>

                    {/* Partial Water Change */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <WaterDropIcon className="h-6 w-6 text-cyan-400" />
                            <div>
                                <p className="font-semibold text-white">Water Change ({aquarium.waterChangePercentage}%)</p>
                                <p className="text-sm text-gray-400">Next: {formatDate(aquarium.nextPartialWaterChange)}</p>
                            </div>
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded-full text-white ${waterChangeStatus.color}`}>
                            {waterChangeStatus.text}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-gray-700/50 grid grid-cols-2">
                <button 
                    onClick={() => onClean(aquarium.id)}
                    className="flex items-center justify-center gap-2 p-3 text-sm font-semibold text-gray-200 hover:bg-gray-700 transition-colors border-r border-gray-600"
                >
                    <CheckIcon className="h-5 w-5"/> Mark as Cleaned
                </button>
                <button 
                    onClick={() => onWaterChange(aquarium.id)}
                    className="flex items-center justify-center gap-2 p-3 text-sm font-semibold text-gray-200 hover:bg-gray-700 transition-colors"
                >
                    <CheckIcon className="h-5 w-5"/> Water Changed
                </button>
            </div>
        </div>
    );
}

export default AquariumCard;
