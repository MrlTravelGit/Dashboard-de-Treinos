import { useState } from 'react';
import { Plus, Trash2, Save, Dumbbell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Exercise, WorkoutSheet } from '@/types/workout';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkoutSheetEditorProps {
  sheet: WorkoutSheet;
  onSave: (sheet: WorkoutSheet) => void;
  onClose: () => void;
}

export const WorkoutSheetEditor = ({ sheet, onSave, onClose }: WorkoutSheetEditorProps) => {
  const [name, setName] = useState(sheet.name);
  const [exercises, setExercises] = useState<Exercise[]>(sheet.exercises);
  const [newExercise, setNewExercise] = useState({ name: '', sets: 3, reps: 12, weight: 0 });

  const sheetColors = {
    A: 'border-primary/50 bg-primary/5',
    B: 'border-accent/50 bg-accent/5',
    C: 'border-blue-500/50 bg-blue-500/5',
  };

  const sheetTextColors = {
    A: 'text-primary',
    B: 'text-accent',
    C: 'text-blue-400',
  };

  const handleAddExercise = () => {
    if (!newExercise.name.trim()) return;
    
    const exercise: Exercise = {
      id: crypto.randomUUID(),
      name: newExercise.name.trim(),
      sets: newExercise.sets,
      reps: newExercise.reps,
      weight: newExercise.weight,
    };
    
    setExercises([...exercises, exercise]);
    setNewExercise({ name: '', sets: 3, reps: 12, weight: 0 });
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const handleUpdateExercise = (id: string, field: keyof Exercise, value: string | number) => {
    setExercises(exercises.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const handleSave = () => {
    onSave({
      type: sheet.type,
      name: name.trim() || `Treino ${sheet.type}`,
      exercises,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`w-full max-w-lg max-h-[85vh] overflow-hidden rounded-xl border-2 ${sheetColors[sheet.type]} bg-card shadow-2xl`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-card ${sheetTextColors[sheet.type]}`}>
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${sheetTextColors[sheet.type]}`}>
                Ficha {sheet.type}
              </h2>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do treino..."
                className="mt-1 h-8 text-sm bg-transparent border-0 p-0 focus-visible:ring-0"
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* Add new exercise */}
          <div className="space-y-2 p-3 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground">Adicionar exercício</p>
            <div className="flex gap-2">
              <Input
                placeholder="Nome do exercício"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                className="flex-1 h-9"
                onKeyDown={(e) => e.key === 'Enter' && handleAddExercise()}
              />
              <Button size="sm" onClick={handleAddExercise} className="h-9 px-3">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Séries</label>
                <Input
                  type="number"
                  min={1}
                  value={newExercise.sets}
                  onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 1 })}
                  className="h-8 text-center"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Repetições</label>
                <Input
                  type="number"
                  min={1}
                  value={newExercise.reps}
                  onChange={(e) => setNewExercise({ ...newExercise, reps: parseInt(e.target.value) || 1 })}
                  className="h-8 text-center"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Carga (kg)</label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={newExercise.weight}
                  onChange={(e) => setNewExercise({ ...newExercise, weight: parseFloat(e.target.value) || 0 })}
                  className="h-8 text-center"
                />
              </div>
            </div>
          </div>

          {/* Exercise list */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Exercícios ({exercises.length})
            </p>
            <AnimatePresence mode="popLayout">
              {exercises.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nenhum exercício adicionado
                </p>
              ) : (
                exercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border"
                  >
                    <span className="text-xs font-bold text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <Input
                      value={exercise.name}
                      onChange={(e) => handleUpdateExercise(exercise.id, 'name', e.target.value)}
                      className="flex-1 h-8 text-sm"
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={1}
                        value={exercise.sets}
                        onChange={(e) => handleUpdateExercise(exercise.id, 'sets', parseInt(e.target.value) || 1)}
                        className="w-12 h-8 text-center text-xs"
                        title="Séries"
                      />
                      <span className="text-muted-foreground text-xs">x</span>
                      <Input
                        type="number"
                        min={1}
                        value={exercise.reps}
                        onChange={(e) => handleUpdateExercise(exercise.id, 'reps', parseInt(e.target.value) || 1)}
                        className="w-12 h-8 text-center text-xs"
                        title="Repetições"
                      />
                      <span className="text-muted-foreground text-xs">@</span>
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        value={exercise.weight}
                        onChange={(e) => handleUpdateExercise(exercise.id, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-14 h-8 text-center text-xs"
                        title="Carga (kg)"
                      />
                      <span className="text-muted-foreground text-xs">kg</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveExercise(exercise.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
