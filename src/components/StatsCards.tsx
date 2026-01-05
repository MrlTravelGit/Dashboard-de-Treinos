import { Trophy, TrendingUp, Clock, Calendar, Target } from 'lucide-react';
import { WorkoutStats } from '@/types/workout';
import { Input } from '@/components/ui/input';

interface StatsCardsProps {
  stats: WorkoutStats;
  onGoalChange: (goal: number) => void;
}

export const StatsCards = ({ stats, onGoalChange }: StatsCardsProps) => {
  const formatTime = (hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* First row - responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-card rounded-lg p-3 sm:p-4 border border-border">
          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-sm mb-1 sm:mb-2">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
            <span>Concluídos</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.completed}</p>
        </div>

        <div className="bg-card rounded-lg p-3 sm:p-4 border border-border">
          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-sm mb-1 sm:mb-2">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span>Progresso</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-primary">{stats.progress.toFixed(1)}%</p>
        </div>

        <div className="bg-card rounded-lg p-3 sm:p-4 border border-border col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-sm mb-1 sm:mb-2">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Horas totais</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            {formatTime(stats.totalHours, stats.totalMinutes)}
          </p>
        </div>
      </div>

      {/* Second row - 2 cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <div className="bg-card rounded-lg p-3 sm:p-4 border border-border">
          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-sm mb-1 sm:mb-2">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Semana Atual</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.currentWeek}</p>
        </div>

        <div className="bg-card rounded-lg p-3 sm:p-4 border border-border">
          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-sm mb-1 sm:mb-2">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
            <span>Meta Anual</span>
          </div>
          <Input
            type="number"
            value={stats.annualGoal}
            onChange={(e) => onGoalChange(parseInt(e.target.value, 10) || 0)}
            className="text-lg sm:text-xl font-bold bg-muted border-0 h-9 sm:h-10"
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            <span className="text-primary font-bold">{stats.completed}</span>
            <span className="text-muted-foreground"> de </span>
            <span className="font-bold">{stats.annualGoal}</span>
            <span className="text-muted-foreground"> treinos</span>
          </span>
          <span className="text-muted-foreground">{stats.remaining} restantes</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(stats.progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
