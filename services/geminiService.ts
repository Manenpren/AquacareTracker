import type { Aquarium } from '../types';

// Sugerencia mecánica basada en reglas simples
type SuggestionResult = { 
  full: number; 
  partial: number; 
  percentage: number; 
};

type AquariumDataForSuggestion = Omit<Aquarium, 'id' | 'lastCleaning' | 'nextCleaning' | 'lastPartialWaterChange' | 'nextPartialWaterChange' | 'icon' | 'iconColor' | 'cleaningFrequency' | 'waterChangeFrequency' | 'waterChangePercentage'>;

export const getCleaningSuggestion = async (
  aquariumData: AquariumDataForSuggestion
): Promise<SuggestionResult> => {
  const { capacity, fishCount, hasFilter, hasPlants } = aquariumData;

  const numericFishCount = Number(fishCount);
  const numericCapacity = Number(capacity);

  let full = 30;
  let partial = 7;
  let percentage = 25;

  if (numericFishCount > 10 || numericCapacity < 40) {
    full = 14;
    partial = 5;
    percentage = 30;
  }
  if (!hasFilter) {
    full -= 5;
    partial -= 2;
    percentage += 10;
  }
  if (hasPlants) {
    full += 7;
    partial += 3;
    percentage -= 5;
  }

  full = Math.max(7, Math.min(90, full));
  partial = Math.max(3, Math.min(30, partial));
  percentage = Math.max(10, Math.min(75, percentage));

  return { full, partial, percentage };
};