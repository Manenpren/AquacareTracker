export interface Aquarium {
  id: string;
  name: string;
  capacity: number; // in liters
  fishSpecies: string; // comma-separated list
  fishCount: string; // e.g., '1-5', '6-10'
  hasFilter: boolean;
  hasPlants: boolean;
  
  icon: string;
  iconColor: string;

  lastCleaning: string; // ISO date string
  nextCleaning: string; // ISO date string
  
  lastPartialWaterChange: string; // ISO date string
  nextPartialWaterChange: string; // ISO date string

  cleaningFrequency: number;
  waterChangeFrequency: number;
  waterChangePercentage: number;

  isLoading?: boolean; // For per-item loading state
}