import { Calendar, Dumbbell } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SheetType } from '@/types/workout';

interface TodayHighlightProps {
  todayWorkoutType: SheetType | 'rest';
  workoutName?: string;
  isCompleted: boolean;
  onSheetClick: () => void;
  onDateClick: () => void;
}

const workoutColors: Record<SheetType | 'rest', string> = {
  A: 'from-primary/20 to-primary/5 border-primary/30',
  B: 'from-accent/20 to-accent/5 border-accent/30',
  C: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
  D: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
  E: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
  rest: 'from-muted/50 to-muted/20 border-muted-foreground/20',
};

const workoutTextColors: Record<SheetType | 'rest', string> = {
  A: 'text-primary',
  B: 'text-accent',
  C: 'text-blue-400',
  D: 'text-purple-400',
  E: 'text-orange-400',
  rest: 'text-muted-foreground',
};

const workoutBgColors: Record<SheetType | 'rest', string> = {
  A: 'bg-primary',
  B: 'bg-accent',
  C: 'bg-blue-500',
  D: 'bg-purple-500',
  E: 'bg-orange-500',
  rest: 'bg-muted',
};

export const TodayHighlight = ({ 
  todayWorkoutType, 
  workoutName, 
  isCompleted,
  onSheetClick,
  onDateClick 
}: TodayHighlightProps) => {
  const today = new Date();
  const formattedDate = format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  const getStatusBadge = () => {
    if (todayWorkoutType === 'rest') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
          Descanso
        </span>
      );
    }
    if (isCompleted) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-500 border border-green-500/30">
          Concluído
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-500 border border-red-500/30">
        Pendente
      </span>
    );
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${workoutColors[todayWorkoutType]} border p-4 sm:p-6`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
      
      <div className="flex items-start justify-between gap-4">
        <div 
          className="space-y-2 cursor-pointer hover:opacity-80 transition-opacity flex-1"
          onClick={onDateClick}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Hoje</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold capitalize text-foreground">
            {formattedDate}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            {getStatusBadge()}
          </div>
        </div>
        
        <div 
          className={`flex flex-col items-center gap-1 ${todayWorkoutType !== 'rest' ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
          onClick={todayWorkoutType !== 'rest' ? onSheetClick : undefined}
        >
          <div className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl ${
            todayWorkoutType === 'rest' 
              ? 'bg-card/50 backdrop-blur' 
              : `${workoutBgColors[todayWorkoutType]} shadow-lg`
          }`}>
            {todayWorkoutType === 'rest' ? (
              <span className="text-2xl">😴</span>
            ) : (
              <span className="text-2xl sm:text-3xl font-bold text-white">{todayWorkoutType}</span>
            )}
          </div>
          <span className={`text-xs font-bold ${workoutTextColors[todayWorkoutType]}`}>
            {todayWorkoutType === 'rest' ? 'Descanso' : `Treino ${todayWorkoutType}`}
          </span>
          {workoutName && todayWorkoutType !== 'rest' && (
            <span className="text-xs text-muted-foreground truncate max-w-[80px]">
              {workoutName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};