import { useState, useEffect, useCallback } from 'react';
import { WorkoutSheet, SheetType } from '@/types/workout';

const SHEETS_STORAGE_KEY = 'workout-sheets-2026';

const defaultSheets: WorkoutSheet[] = [
  { type: 'A', name: 'Treino A', exercises: [] },
  { type: 'B', name: 'Treino B', exercises: [] },
  { type: 'C', name: 'Treino C', exercises: [] },
  { type: 'D', name: 'Treino D', exercises: [] },
  { type: 'E', name: 'Treino E', exercises: [] },
];

export const useWorkoutSheets = () => {
  const [sheets, setSheets] = useState<WorkoutSheet[]>(() => {
    const saved = localStorage.getItem(SHEETS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure we have all 5 sheets
        const allTypes: SheetType[] = ['A', 'B', 'C', 'D', 'E'];
        const existingTypes = parsed.map((s: WorkoutSheet) => s.type);
        const missing = allTypes.filter(t => !existingTypes.includes(t));
        
        if (missing.length > 0) {
          return [
            ...parsed,
            ...missing.map(type => ({ type, name: `Treino ${type}`, exercises: [] }))
          ];
        }
        return parsed;
      } catch {
        return defaultSheets;
      }
    }
    return defaultSheets;
  });

  useEffect(() => {
    localStorage.setItem(SHEETS_STORAGE_KEY, JSON.stringify(sheets));
  }, [sheets]);

  const updateSheet = useCallback((updatedSheet: WorkoutSheet) => {
    setSheets(prev => 
      prev.map(sheet => 
        sheet.type === updatedSheet.type ? updatedSheet : sheet
      )
    );
  }, []);

  const getSheetByType = useCallback((type: SheetType): WorkoutSheet | undefined => {
    return sheets.find(sheet => sheet.type === type);
  }, [sheets]);

  return {
    sheets,
    updateSheet,
    getSheetByType,
  };
};
