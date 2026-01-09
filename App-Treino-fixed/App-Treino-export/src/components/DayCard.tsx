import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Save, FileText, Trash2, CheckCircle2, Circle, Dumbbell } from 'lucide-react';
import { DayWorkout, WorkoutSession, SheetType, Exercise } from '@/types/workout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface DayCardProps {
  day: DayWorkout;
  dayOfWeek: string;
  displayDate: string;
  isExpanded: boolean;
  isToday: boolean;
  exercises?: Exercise[];
  sheetName?: string;
  onToggle: () => void;
  onSaveSession: (duration: number, isManual: boolean, justification?: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onToggleExercise: (exerciseId: string) => void;
  formatTime: (seconds: number) => string;
  formatTimeDetailed: (seconds: number) => string;
}

const workoutTypeColors: Record<SheetType | 'rest', string> = {
  A: 'bg-yellow-500 text-black',
  B: 'bg-purple-500 text-white',
  C: 'bg-cyan-500 text-black',
  D: 'bg-pink-500 text-white',
  E: 'bg-orange-500 text-black',
  rest: 'bg-muted text-muted-foreground',
};

const workoutTextColors: Record<SheetType | 'rest', string> = {
  A: 'text-yellow-500',
  B: 'text-purple-500',
  C: 'text-cyan-500',
  D: 'text-pink-500',
  E: 'text-orange-500',
  rest: 'text-muted-foreground',
};

export const DayCard = ({
  day,
  dayOfWeek,
  displayDate,
  isExpanded,
  isToday,
  exercises = [],
  sheetName,
  onToggle,
  onSaveSession,
  onDeleteSession,
  onToggleExercise,
  formatTime,
  formatTimeDetailed,
}: DayCardProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showManual, setShowManual] = useState(false);
  const [manualHours, setManualHours] = useState('0');
  const [manualMinutes, setManualMinutes] = useState('0');
  const [justification, setJustification] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const completedExercises = day.completedExercises || [];
  const completedCount = exercises.filter(e => completedExercises.includes(e.id)).length;
  const allExercisesCompleted = exercises.length > 0 && completedCount === exercises.length;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleSaveTimer = () => {
    if (seconds > 0) {
      onSaveSession(seconds, false);
      setSeconds(0);
      setIsRunning(false);
    }
  };

  const handleSaveManual = () => {
    const totalSeconds = (parseInt(manualHours, 10) || 0) * 3600 + (parseInt(manualMinutes, 10) || 0) * 60;
    if (totalSeconds > 0) {
      onSaveSession(totalSeconds, true, justification || undefined);
      setManualHours('0');
      setManualMinutes('0');
      setJustification('');
      setShowManual(false);
    }
  };

  const handleReset = () => {
    setSeconds(0);
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col">
      <div
        onClick={onToggle}
        className={`cursor-pointer p-3 rounded-lg transition-all border relative ${
          isToday 
            ? 'border-primary border-2 bg-primary/10 ring-2 ring-primary/30 shadow-lg shadow-primary/20' 
            : isExpanded 
              ? 'border-primary bg-primary/5' 
              : 'border-border bg-card hover:bg-muted/50'
        }`}
      >
        {isToday && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
            HOJE
          </div>
        )}
        <p className="text-xs text-muted-foreground text-center mb-1">{dayOfWeek}</p>
        <p className="text-sm font-medium text-center mb-2">{displayDate}</p>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          {day.workoutType !== 'rest' ? (
            <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${workoutTypeColors[day.workoutType]}`}>
              {day.workoutType}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Descanso</span>
          )}
          
          <div className={`w-4 h-4 rounded-full border-2 ${
            day.completed ? 'bg-primary border-primary' : 'border-muted-foreground'
          }`} />
        </div>

        {/* Exercise progress indicator */}
        {exercises.length > 0 && (
          <div className="text-center mb-1">
            <span className={`text-[10px] ${allExercisesCompleted ? 'text-green-500' : 'text-muted-foreground'}`}>
              {completedCount}/{exercises.length} exercícios
            </span>
          </div>
        )}

        <div className="text-center">
          <span className="text-xs text-muted-foreground">Tempo</span>
          <p className={`text-sm font-mono font-bold ${day.duration > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
            {formatTime(day.duration)}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 mt-2 bg-card rounded-lg border border-primary space-y-4">
              {/* Workout Sheet Exercises */}
              {day.workoutType !== 'rest' && exercises.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Dumbbell className={`w-4 h-4 ${workoutTextColors[day.workoutType]}`} />
                    <h4 className={`font-semibold ${workoutTextColors[day.workoutType]}`}>
                      {sheetName || `Treino ${day.workoutType}`}
                    </h4>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {completedCount}/{exercises.length}
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {exercises.map((exercise) => {
                      const isCompleted = completedExercises.includes(exercise.id);
                      return (
                        <div
                          key={exercise.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleExercise(exercise.id);
                          }}
                          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all ${
                            isCompleted 
                              ? 'bg-green-500/10 border border-green-500/30' 
                              : 'bg-muted/50 hover:bg-muted'
                          }`}
                        >
                          <Checkbox 
                            checked={isCompleted}
                            className="pointer-events-none"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                              {exercise.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {exercise.sets}x{exercise.reps} {exercise.weight > 0 && `@ ${exercise.weight}kg`}
                            </p>
                          </div>
                          {isCompleted && (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {day.workoutType !== 'rest' && exercises.length === 0 && (
                <div className="text-center py-3 text-muted-foreground text-sm">
                  <p>Nenhum exercício cadastrado na ficha</p>
                </div>
              )}

              {/* Timer */}
              <div className="text-center border-t border-border pt-4">
                <p className="text-xs text-muted-foreground mb-2">Cronômetro</p>
                <p className={`text-3xl font-mono font-bold mb-4 ${isRunning ? 'text-primary' : 'text-foreground'}`}>
                  {formatTimeDetailed(seconds)}
                </p>
                
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant={isRunning ? 'destructive' : 'default'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRunning(!isRunning);
                    }}
                  >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  
                  {seconds > 0 && !isRunning && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveTimer();
                      }}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Salvar
                    </Button>
                  )}
                </div>
              </div>

              {/* Manual Entry Toggle */}
              <div className="border-t border-border pt-4">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowManual(!showManual);
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Entrada Manual
                </Button>

                <AnimatePresence>
                  {showManual && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">Horas</label>
                          <Input
                            type="number"
                            min="0"
                            value={manualHours}
                            onChange={(e) => setManualHours(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">Minutos</label>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={manualMinutes}
                            onChange={(e) => setManualMinutes(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground">Justificativa</label>
                        <Textarea
                          placeholder="Por que não usou o cronômetro?"
                          value={justification}
                          onChange={(e) => setJustification(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          rows={2}
                        />
                      </div>
                      
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveManual();
                        }}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Manual
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sessions History */}
              {day.sessions.length > 0 && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground mb-2">Histórico</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {day.sessions.map((session) => (
                      <div key={session.id} className="flex justify-between items-center text-xs bg-muted/50 p-2 rounded group">
                        <span className="text-muted-foreground truncate">
                          {session.isManual ? '📝' : '⏱️'} {new Date(session.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="font-mono text-primary">{formatTime(session.duration)}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};