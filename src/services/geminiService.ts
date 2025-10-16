import type { Aquarium } from '../types';

type SuggestionResult = {
  full: number;
  partial: number;
  percentage: number;
};

type AquariumDataForSuggestion = Omit<
  Aquarium,
  | 'id'
  | 'lastCleaning'
  | 'nextCleaning'
  | 'lastPartialWaterChange'
  | 'nextPartialWaterChange'
  | 'icon'
  | 'iconColor'
  | 'cleaningFrequency'
  | 'waterChangeFrequency'
  | 'waterChangePercentage'
>;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const parseFishCount = (fishCount: string): number => {
  if (!fishCount) {
    return 0;
  }

  const normalized = fishCount.trim();

  const rangeMatch = normalized.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rangeMatch) {
    const lower = Number(rangeMatch[1]);
    const upper = Number(rangeMatch[2]);
    if (!Number.isNaN(lower) && !Number.isNaN(upper) && upper >= lower) {
      return (lower + upper) / 2;
    }
  }

  const plusMatch = normalized.match(/^(\d+)\s*\+$/);
  if (plusMatch) {
    const base = Number(plusMatch[1]);
    if (!Number.isNaN(base)) {
      return base + 2;
    }
  }

  const numeric = Number(normalized.replace(/[^\d.]/g, ''));
  if (!Number.isNaN(numeric)) {
    return numeric;
  }

  return 0;
};

const estimateLoadModifier = (
  capacity: number,
  fishCount: number,
  hasFilter: boolean,
  hasPlants: boolean
) => {
  const safeCapacity = capacity > 0 ? capacity : 40;
  const normalizedFishCount = fishCount > 0 ? fishCount : 1;
  const litersPerFish = safeCapacity / normalizedFishCount;

  let modifier = 1;

  if (safeCapacity < 40) {
    modifier += 0.2;
  } else if (safeCapacity > 150) {
    modifier -= 0.15;
  }

  if (litersPerFish < 5) {
    modifier += 0.45;
  } else if (litersPerFish < 8) {
    modifier += 0.25;
  } else if (litersPerFish > 18) {
    modifier -= 0.2;
  } else if (litersPerFish > 12) {
    modifier -= 0.1;
  }

  if (!hasFilter) {
    modifier += 0.35;
  } else {
    modifier -= 0.1;
  }

  if (hasPlants) {
    modifier -= 0.15;
  } else {
    modifier += 0.05;
  }

  return clamp(modifier, 0.55, 1.85);
};

export const getCleaningSuggestion = async (
  aquariumData: AquariumDataForSuggestion
): Promise<SuggestionResult> => {
  const capacity = Number(aquariumData.capacity) || 0;
  const fishCount = parseFishCount(aquariumData.fishCount);
  const loadModifier = estimateLoadModifier(
    capacity,
    fishCount,
    aquariumData.hasFilter,
    aquariumData.hasPlants
  );

  const baseFull = 30;
  const basePartial = 10;
  const basePercentage = 25;

  const full = clamp(Math.round(baseFull / loadModifier), 7, 75);
  const partial = clamp(Math.round(Math.max(full / 2.2, basePartial / loadModifier)), 3, 30);
  const percentage = clamp(
    Math.round(basePercentage * loadModifier + (aquariumData.hasFilter ? -2 : 3) + (aquariumData.hasPlants ? -3 : 0)),
    15,
    60
  );

  return { full, partial, percentage };
};
