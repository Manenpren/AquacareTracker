import { GoogleGenAI, Type } from "@google/genai";
import type { Aquarium } from '../types';

const apiKey = import.meta.env.VITE_API_KEY;

if (!apiKey) {
  console.warn("API_KEY environment variable not set. API calls will fail.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

type SuggestionResult = {
  full: number;
  partial: number;
  percentage: number;
};

type AquariumDataForSuggestion = Omit<Aquarium, 'id' | 'lastCleaning' | 'nextCleaning' | 'lastPartialWaterChange' | 'nextPartialWaterChange' | 'icon' | 'iconColor' | 'cleaningFrequency' | 'waterChangeFrequency' | 'waterChangePercentage'>;

export const getCleaningSuggestion = async (
  aquariumData: AquariumDataForSuggestion
): Promise<SuggestionResult> => {
  if (!ai) {
    throw new Error("API_KEY environment variable not set. Cannot fetch new suggestions.");
  }

  const prompt = `
    You are an expert aquarist. Based on the following aquarium setup, provide a recommended frequency in days for both a full cleaning (including substrate vacuuming) and a partial water change. Also, provide the recommended percentage of water to change for the partial change.

    Aquarium Details:
    - Capacity: ${aquariumData.capacity} liters
    - Fish Species: ${aquariumData.fishSpecies}
    - Number of Fish: ${aquariumData.fishCount}
    - Has a filter: ${aquariumData.hasFilter ? 'Yes' : 'No'}
    - Has live plants: ${aquariumData.hasPlants ? 'Yes' : 'No'}

    Consider the bioload from the fish count and species, the tank size, and the benefits of filters and live plants. A tank with more fish, a smaller size, no filter, and no plants will need cleaning more frequently. A large, sparsely populated tank with a good filter and plants can go longer between cleanings. Partial water changes should be more frequent than full cleanings. The water change percentage should typically be between 15% and 50%.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullCleaningFrequencyInDays: {
              type: Type.INTEGER,
              description: 'The recommended number of days between each full cleaning.',
            },
            partialWaterChangeFrequencyInDays: {
              type: Type.INTEGER,
              description: 'The recommended number of days between each partial water change.',
            },
            waterChangePercentage: {
              type: Type.INTEGER,
              description: 'The recommended percentage of water to change during a partial change (e.g., 25 for 25%).',
            },
          },
          required: ['fullCleaningFrequencyInDays', 'partialWaterChangeFrequencyInDays', 'waterChangePercentage'],
        },
      },
    });

    const jsonString = response.text?.trim();

    if (!jsonString) {
      throw new Error('Empty response from API');
    }

    const result = JSON.parse(jsonString);

    if (
      result &&
      typeof result.fullCleaningFrequencyInDays === 'number' &&
      typeof result.partialWaterChangeFrequencyInDays === 'number' &&
      typeof result.waterChangePercentage === 'number'
    ) {
      const full = Math.max(7, Math.min(90, result.fullCleaningFrequencyInDays));
      const partial = Math.max(3, Math.min(30, result.partialWaterChangeFrequencyInDays));
      const percentage = Math.max(10, Math.min(75, result.waterChangePercentage));
      return { full, partial, percentage };
    }

    throw new Error('Invalid JSON response from API');
  } catch (error) {
    console.error("Error fetching cleaning suggestion from Gemini API:", error);
    throw new Error("Could not get a cleaning suggestion. The model may have returned an invalid response.");
  }
};
