import React, { useState, useEffect } from 'react';
import { Aquarium } from '../types';
import { XIcon, IconMap } from './Icons';

interface AddAquariumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (aquarium: Aquarium) => void;
  aquariumToEdit?: Aquarium | null;
}

const defaultAquariumState: Omit<Aquarium, 'id'> = {
  name: '',
  capacity: 20,
  fishSpecies: '',
  fishCount: '1-5',
  hasFilter: true,
  hasPlants: false,
  icon: 'aquarium',
  iconColor: '#3b82f6',
  lastCleaning: new Date().toISOString(),
  nextCleaning: '',
  lastPartialWaterChange: new Date().toISOString(),
  nextPartialWaterChange: '',
  cleaningFrequency: 30,
  waterChangeFrequency: 7,
  waterChangePercentage: 25,
};

// Local schedule calculation logic, replacing the AI service call
const calculateSchedule = (data: Partial<Aquarium>): { cleaningFrequency: number; waterChangeFrequency: number; waterChangePercentage: number; } => {
    let cleaningFrequency = 30;
    let waterChangeFrequency = 10;
    let waterChangePercentage = 25;

    // Adjust based on capacity
    if (data.capacity) {
        if (data.capacity < 40) {
            cleaningFrequency -= 7;
            waterChangeFrequency -= 3;
            waterChangePercentage += 5;
        } else if (data.capacity > 100) {
            cleaningFrequency += 15;
            waterChangeFrequency += 5;
            waterChangePercentage -= 5;
        }
    }

    // Adjust based on fish count
    switch (data.fishCount) {
        case '6-10':
            cleaningFrequency -= 5;
            waterChangeFrequency -= 2;
            waterChangePercentage += 5;
            break;
        case '11-20':
            cleaningFrequency -= 10;
            waterChangeFrequency -= 4;
            waterChangePercentage += 10;
            break;
        case '20+':
            cleaningFrequency -= 15;
            waterChangeFrequency -= 6;
            waterChangePercentage += 15;
            break;
    }
    
    // Adjust based on filter
    if (!data.hasFilter) {
        cleaningFrequency -= 10;
        waterChangeFrequency -= 3;
        waterChangePercentage += 10;
    }

    // Adjust based on plants
    if (data.hasPlants) {
        cleaningFrequency += 7;
        waterChangeFrequency += 3;
        waterChangePercentage -= 5;
    }

    return {
        cleaningFrequency: Math.round(Math.max(7, Math.min(90, cleaningFrequency))),
        waterChangeFrequency: Math.round(Math.max(3, Math.min(30, waterChangeFrequency))),
        waterChangePercentage: Math.round(Math.max(10, Math.min(75, waterChangePercentage))),
    };
};

const AddAquariumModal: React.FC<AddAquariumModalProps> = ({ isOpen, onClose, onSave, aquariumToEdit }) => {
  const [aquarium, setAquarium] = useState(defaultAquariumState);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (aquariumToEdit) {
          setAquarium(aquariumToEdit);
          setIsManualOverride(true); // When editing, existing values are considered manual
        } else {
          // For a new aquarium, set defaults and auto-calculate schedule
          const initialState = {...defaultAquariumState};
          const initialSuggestion = calculateSchedule(initialState);
          setAquarium({...initialState, ...initialSuggestion});
          setIsManualOverride(false); 
        }
        setError('');
    }
  }, [aquariumToEdit, isOpen]);

  // Effect for auto-calculation
  useEffect(() => {
    if (isManualOverride || !isOpen) return;

    const suggestion = calculateSchedule(aquarium);
    setAquarium(prev => ({
        ...prev,
        cleaningFrequency: suggestion.cleaningFrequency,
        waterChangeFrequency: suggestion.waterChangeFrequency,
        waterChangePercentage: suggestion.waterChangePercentage,
    }));
  }, [
    aquarium.capacity, 
    aquarium.fishCount, 
    aquarium.hasFilter, 
    aquarium.hasPlants, 
    isManualOverride,
    isOpen
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    const isScheduleField = ['cleaningFrequency', 'waterChangeFrequency', 'waterChangePercentage'].includes(name);
    const isPrimaryField = ['capacity', 'fishCount', 'hasFilter', 'hasPlants'].includes(name);

    if (isScheduleField) {
        setIsManualOverride(true);
    } else if (isPrimaryField) {
        setIsManualOverride(false); // Re-enable auto-calculation
    }
    
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setAquarium(prev => ({ ...prev, [name]: checked }));
    } else {
        setAquarium(prev => ({ ...prev, [name]: (name === 'capacity' || name.includes('Frequency') || name.includes('Percentage')) ? parseFloat(value) || 0 : value }));
    }
  };

  const addDays = (date: string, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aquarium.name) {
      setError('Aquarium name is required.');
      return;
    }

    const finalAquarium: Aquarium = {
      ...(aquariumToEdit || { id: crypto.randomUUID() }),
      ...aquarium,
      nextCleaning: addDays(aquarium.lastCleaning, aquarium.cleaningFrequency),
      nextPartialWaterChange: addDays(aquarium.lastPartialWaterChange, aquarium.waterChangeFrequency),
    };
    onSave(finalAquarium);
    onClose();
  };
  
  if (!isOpen) return null;

  const availableIcons = ['aquarium', 'fish', 'plant'];
  const availableColors = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6'];
  const CurrentIcon = IconMap[aquarium.icon];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{aquariumToEdit ? 'Edit' : 'Add'} Aquarium</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
            {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Aquarium Name</label>
                        <input type="text" name="name" id="name" value={aquarium.name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="capacity" className="block text-sm font-medium text-gray-300">Capacity (Liters)</label>
                        <input type="number" name="capacity" id="capacity" value={aquarium.capacity} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" min="1" />
                    </div>
                </div>

                {/* Fish Info */}
                <div>
                    <label htmlFor="fishSpecies" className="block text-sm font-medium text-gray-300">Fish Species (comma-separated)</label>
                    <input type="text" name="fishSpecies" id="fishSpecies" value={aquarium.fishSpecies} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Neon Tetra, Guppy" />
                </div>
                 <div>
                    <label htmlFor="fishCount" className="block text-sm font-medium text-gray-300">Number of Fish</label>
                    <select name="fishCount" id="fishCount" value={aquarium.fishCount} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        <option>1-5</option>
                        <option>6-10</option>
                        <option>11-20</option>
                        <option>20+</option>
                    </select>
                </div>
                
                {/* Equipment */}
                <div className="flex items-center justify-around">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" name="hasFilter" checked={aquarium.hasFilter} onChange={handleChange} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600" />
                        <span>Has Filter?</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" name="hasPlants" checked={aquarium.hasPlants} onChange={handleChange} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600" />
                        <span>Has Live Plants?</span>
                    </label>
                </div>

                 {/* Icon and Color */}
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: aquarium.iconColor, color: 'white' }}>
                        <CurrentIcon className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300">Icon</label>
                        <div className="flex gap-2 mt-1">
                            {availableIcons.map(iconName => (
                                <button key={iconName} type="button" onClick={() => setAquarium(p => ({...p, icon: iconName}))} className={`p-2 rounded-full ${aquarium.icon === iconName ? 'ring-2 ring-blue-500' : 'bg-gray-700'}`}>
                                    {React.createElement(IconMap[iconName], { className: "h-6 w-6" })}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1">
                         <label className="block text-sm font-medium text-gray-300">Color</label>
                         <div className="flex gap-2 mt-1">
                            {availableColors.map(color => (
                                <button key={color} type="button" onClick={() => setAquarium(p => ({...p, iconColor: color}))} className={`h-8 w-8 rounded-full ${aquarium.iconColor === color ? 'ring-2 ring-white' : ''}`} style={{ backgroundColor: color }}></button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cleaning Schedule */}
                <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Cleaning Schedule <span className="text-sm font-normal text-gray-400">(Auto-calculated)</span></h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                            <label htmlFor="cleaningFrequency" className="block text-sm font-medium text-gray-300">Full Clean (days)</label>
                            <input type="number" name="cleaningFrequency" id="cleaningFrequency" value={aquarium.cleaningFrequency} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" min="1" />
                        </div>
                        <div>
                            <label htmlFor="waterChangeFrequency" className="block text-sm font-medium text-gray-300">Water Change (days)</label>
                            <input type="number" name="waterChangeFrequency" id="waterChangeFrequency" value={aquarium.waterChangeFrequency} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" min="1" />
                        </div>
                        <div>
                            <label htmlFor="waterChangePercentage" className="block text-sm font-medium text-gray-300">Change (%)</label>
                            <input type="number" name="waterChangePercentage" id="waterChangePercentage" value={aquarium.waterChangePercentage} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" min="1" max="100"/>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 bg-gray-600 hover:bg-gray-500">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Save Aquarium</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AddAquariumModal;
