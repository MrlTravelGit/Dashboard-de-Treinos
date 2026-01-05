import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WeekData, WorkoutSheet, SheetType } from '@/types/workout';
import { DayCard } from './DayCard';
import { motion, AnimatePresence } from 'framer-motion';

interface WeekCardCompactProps {
  week: WeekData;
  expandedDay: string | null;
  sheets: WorkoutSheet[];
  onToggleDay: (date: string) => void;
  onSaveSession: (date: string, duration: number, isManual: boolean, justification?: string) => void;
  onDeleteSession: (date: string, sessionId: string) => void;
  onToggleExercise: (date: string, exerciseId: string) => void;
  formatTime: (seconds: number) => string;
  formatTimeDetailed: (seconds: number) => string;
}

const workoutTypeColors: Record<string, string> = {
  A: 'bg-yellow-500',
  B: 'bg-purple-500',
  C: 'bg-cyan-500',
  D: 'bg-pink-500',
  E: 'bg-orange-500',
  rest: 'bg-muted',
};

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const WeekCardCompact = ({ 
  week, 
  expandedDay,
  sheets,
  onToggleDay,
  onSaveSession,
  onDeleteSession,
  onToggleExercise,
  formatTime,
  formatTimeDetailed
}: WeekCardCompactProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const completedCount = week.days.filter(d => d.completed && d.workoutType !== 'rest').length;
  const totalWorkouts = week.days.filter(d => d.workoutType !== 'rest').length;

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start + 'T12:00:00');
    const endDate = new Date(end + 'T12:00:00');
    const startDay = startDate.getDate().toString().padStart(2, '0');
    const endDay = endDate.getDate().toString().padStart(2, '0');
    const startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0');
    const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
    return `${startDay}/${startMonth} - ${endDay}/${endMonth}`;
  };

  const getSheetForDay = (workoutType: SheetType | 'rest') => {
    if (workoutType === 'rest') return undefined;
    return sheets.find(s => s.type === workoutType);
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div 
        className="flex items-center justify-between gap-2 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="px-2 py-1 rounded text-xs font-bold bg-muted text-muted-foreground">
            S{week.weekNumber}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {formatDateRange(week.startDate, week.endDate)}
          </span>
        </div>

        {/* Mini day indicators */}
        <div className="flex items-center gap-1">
          {week.days.map((day) => (
            <div
              key={day.date}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                day.completed 
                  ? workoutTypeColors[day.workoutType] 
                  : day.workoutType === 'rest' 
                    ? 'bg-muted' 
                    : 'border border-muted-foreground/30'
              }`}
              title={`${day.date} - ${day.workoutType}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs">
            <span className="text-primary font-bold">{completedCount}</span>
            <span className="text-muted-foreground">/{totalWorkouts}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {week.days.map((day) => {
                  const date = new Date(day.date + 'T12:00:00');
                  const dayOfWeek = dayNames[date.getDay()];
                  const displayDate = `${date.getDate().toString().padStart(2, '0')} de ${monthNames[date.getMonth()]}`;
                  
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const dayDate = new Date(day.date + 'T00:00:00');
                  const isToday = dayDate.getTime() === today.getTime();
                  
                  const sheet = getSheetForDay(day.workoutType);
                  
                  return (
                    <DayCard
                      key={day.date}
                      day={day}
                      dayOfWeek={dayOfWeek}
                      displayDate={displayDate}
                      isExpanded={expandedDay === day.date}
                      isToday={isToday}
                      exercises={sheet?.exercises}
                      sheetName={sheet?.name}
                      onToggle={() => onToggleDay(day.date)}
                      onSaveSession={(duration, isManual, justification) => 
                        onSaveSession(day.date, duration, isManual, justification)
                      }
                      onDeleteSession={(sessionId) => onDeleteSession(day.date, sessionId)}
                      onToggleExercise={(exerciseId) => onToggleExercise(day.date, exerciseId)}
                      formatTime={formatTime}
                      formatTimeDetailed={formatTimeDetailed}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};