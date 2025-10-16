import React, { useState } from 'react';
import { Aquarium } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import AquariumList from './components/AquariumList';
import AddAquariumModal from './components/AddAquariumModal';

const App: React.FC = () => {
  const [aquariums, setAquariums] = useLocalStorage<Aquarium[]>('aquariums', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aquariumToEdit, setAquariumToEdit] = useState<Aquarium | null>(null);

  const addDays = (date: string, days: number): string => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
  };

  const handleOpenModal = () => {
    setAquariumToEdit(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAquariumToEdit(null);
  };

  const handleSaveAquarium = (aquarium: Aquarium) => {
    setAquariums(prev => {
      const existingIndex = prev.findIndex(a => a.id === aquarium.id);
      if (existingIndex > -1) {
        const newAquariums = [...prev];
        newAquariums[existingIndex] = aquarium;
        return newAquariums;
      }
      return [...prev, aquarium];
    });
    handleCloseModal();
  };

  const handleDeleteAquarium = (id: string) => {
    if (window.confirm('Are you sure you want to delete this aquarium?')) {
        setAquariums(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleMarkAsCleaned = (id: string) => {
    setAquariums(prev => prev.map(aq => {
      if (aq.id === id) {
        const today = new Date().toISOString();
        return {
          ...aq,
          lastCleaning: today,
          nextCleaning: addDays(today, aq.cleaningFrequency)
        };
      }
      return aq;
    }));
  };
  
  const handleMarkWaterChanged = (id: string) => {
    setAquariums(prev => prev.map(aq => {
      if (aq.id === id) {
        const today = new Date().toISOString();
        return {
          ...aq,
          lastPartialWaterChange: today,
          nextPartialWaterChange: addDays(today, aq.waterChangeFrequency)
        };
      }
      return aq;
    }));
  };
  
  const handleEditAquarium = (aquarium: Aquarium) => {
      setAquariumToEdit(aquarium);
      setIsModalOpen(true);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white font-['Poppins']">
      <Header onAddAquarium={handleOpenModal} />
      <main>
        <AquariumList 
          aquariums={aquariums}
          onDelete={handleDeleteAquarium}
          onClean={handleMarkAsCleaned}
          onWaterChange={handleMarkWaterChanged}
          onEdit={handleEditAquarium}
        />
      </main>
      <AddAquariumModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAquarium}
        aquariumToEdit={aquariumToEdit}
      />
    </div>
  );
};

export default App;
