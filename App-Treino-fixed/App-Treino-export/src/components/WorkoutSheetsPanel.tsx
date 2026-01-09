import { useState, useRef, useEffect } from 'react';
import { Dumbbell, Edit2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkoutSheet, SheetType } from '@/types/workout';
import { WorkoutSheetEditor } from './WorkoutSheetEditor';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkoutSheetsPanelProps {
  sheets: WorkoutSheet[];
  sheetCount: number;
  expandedSheet: SheetType | null;
  onUpdateSheet: (sheet: WorkoutSheet) => void;
  onSheetCountChange: (count: number) => void;
  onExpandSheet: (type: SheetType | null) => void;
}

const sheetColors: Record<SheetType, string> = {
  A: 'border-primary/30 hover:border-primary/50',
  B: 'border-accent/30 hover:border-accent/50',
  C: 'border-blue-500/30 hover:border-blue-500/50',
  D: 'border-purple-500/30 hover:border-purple-500/50',
  E: 'border-orange-500/30 hover:border-orange-500/50',
};

const sheetTextColors: Record<SheetType, string> = {
  A: 'text-primary',
  B: 'text-accent',
  C: 'text-blue-400',
  D: 'text-purple-400',
  E: 'text-orange-400',
};

const sheetBgColors: Record<SheetType, string> = {
  A: 'bg-primary/10',
  B: 'bg-accent/10',
  C: 'bg-blue-500/10',
  D: 'bg-purple-500/10',
  E: 'bg-orange-500/10',
};

const sheetRingColors: Record<SheetType, string> = {
  A: 'ring-primary',
  B: 'ring-accent',
  C: 'ring-blue-500',
  D: 'ring-purple-500',
  E: 'ring-orange-500',
};

export const WorkoutSheetsPanel = ({ 
  sheets, 
  sheetCount, 
  expandedSheet,
  onUpdateSheet, 
  onSheetCountChange,
  onExpandSheet 
}: WorkoutSheetsPanelProps) => {
  const [editingSheet, setEditingSheet] = useState<WorkoutSheet | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleSave = (sheet: WorkoutSheet) => {
    onUpdateSheet(sheet);
    setEditingSheet(null);
  };

  const handleCardClick = (sheetType: SheetType) => {
    onExpandSheet(expandedSheet === sheetType ? null : sheetType);
  };

  const activeSheets = sheets.slice(0, sheetCount);

  // Scroll into view when sheet is expanded externally
  useEffect(() => {
    if (expandedSheet && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [expandedSheet]);

  return (
    <>
      <div ref={panelRef} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Fichas de Treino</h2>
          </div>
          
          {/* Sheet count selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Fichas:</span>
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onSheetCountChange(Math.max(1, sheetCount - 1))}
                disabled={sheetCount <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-6 text-center font-semibold">{sheetCount}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onSheetCountChange(Math.min(5, sheetCount + 1))}
                disabled={sheetCount >= 5}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className={`grid gap-2 sm:gap-3 ${
          sheetCount <= 3 ? 'grid-cols-3' : sheetCount === 4 ? 'grid-cols-4' : 'grid-cols-5'
        }`}>
          {activeSheets.map((sheet) => (
            <div
              key={sheet.type}
              onClick={() => handleCardClick(sheet.type)}
              className={`cursor-pointer rounded-lg border-2 transition-all ${sheetColors[sheet.type]} ${
                expandedSheet === sheet.type ? 'ring-2 ring-offset-2 ring-offset-background' : ''
              } ${sheetRingColors[sheet.type]} bg-card p-2 sm:p-4`}
            >
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                <div className={`flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl ${sheetBgColors[sheet.type]} ${sheetTextColors[sheet.type]}`}>
                  <span className="font-bold text-lg sm:text-2xl">{sheet.type}</span>
                </div>
                <div className="text-center">
                  <h3 className={`font-semibold text-xs sm:text-base ${sheetTextColors[sheet.type]} truncate max-w-full`}>
                    {sheet.name || `Treino ${sheet.type}`}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {sheet.exercises.length} exercício{sheet.exercises.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Expanded Sheet Content */}
        <AnimatePresence>
          {expandedSheet && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {activeSheets.filter(s => s.type === expandedSheet).map((sheet) => (
                <div 
                  key={sheet.type}
                  className={`rounded-lg border-2 ${sheetColors[sheet.type]} bg-card p-4`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${sheetBgColors[sheet.type]} ${sheetTextColors[sheet.type]}`}>
                        <span className="font-bold text-lg">{sheet.type}</span>
                      </div>
                      <div>
                        <h3 className={`font-semibold ${sheetTextColors[sheet.type]}`}>
                          {sheet.name || `Treino ${sheet.type}`}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {sheet.exercises.length} exercício{sheet.exercises.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSheet(sheet);
                      }}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>

                  {sheet.exercises.length > 0 ? (
                    <div className="space-y-2">
                      {sheet.exercises.map((exercise, index) => (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground w-6">
                              {index + 1}.
                            </span>
                            <span className="font-medium">{exercise.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">{exercise.sets}</span>
                            <span>séries x</span>
                            <span className="font-semibold text-foreground">{exercise.reps}</span>
                            <span>reps</span>
                            {exercise.weight > 0 && (
                              <>
                                <span>@</span>
                                <span className={`font-semibold ${sheetTextColors[sheet.type]}`}>
                                  {exercise.weight}kg
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p className="text-sm">Nenhum exercício cadastrado</p>
                      <Button
                        variant="link"
                        size="sm"
                        className={sheetTextColors[sheet.type]}
                        onClick={() => setEditingSheet(sheet)}
                      >
                        Adicionar exercícios
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editingSheet && (
          <WorkoutSheetEditor
            sheet={editingSheet}
            onSave={handleSave}
            onClose={() => setEditingSheet(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};