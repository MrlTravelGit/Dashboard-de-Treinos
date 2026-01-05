import { useState, useRef } from 'react';
import { TodayHighlight } from './TodayHighlight';
import { StatsCards } from './StatsCards';
import { MonthlyView } from './MonthlyView';
import { WorkoutSheetsPanel } from './WorkoutSheetsPanel';
import { RestDaysConfig } from './RestDaysConfig';
import { WeekCard } from './WeekCard';
import { WeekCardCompact } from './WeekCardCompact';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useWorkoutSheets } from '@/hooks/useWorkoutSheets';
import { SheetType } from '@/types/workout';

export const Dashboard = () => {
  const {
    weeks,
    restDays,
    sheetCount,
    expandedDay,
    updateRestDays,
    updateSheetCount,
    updateAnnualGoal,
    toggleDayExpanded,
    addSession,
    deleteSession,
    toggleExerciseComplete,
    getStats,
    getMonthlyStats,
    formatTime,
    formatTimeDetailed,
  } = useWorkouts();

  const { sheets, updateSheet, getSheetByType } = useWorkoutSheets();
  
  const [expandedSheet, setExpandedSheet] = useState<SheetType | null>(null);
  const weekCardRef = useRef<HTMLDivElement>(null);

  const stats = getStats();
  const monthlyStats = getMonthlyStats();
  const currentMonth = new Date().getMonth();

  // Get today's workout type
  const today = new Date().toISOString().split('T')[0];
  const todayWorkout = weeks
    .flatMap(w => w.days)
    .find(d => d.date === today);
  const todayWorkoutType = todayWorkout?.workoutType || 'rest';
  const todaySheet = todayWorkoutType !== 'rest' ? getSheetByType(todayWorkoutType) : undefined;
  const isTodayCompleted = todayWorkout?.completed || false;

  // Get active sheets based on sheetCount
  const activeSheets = sheets.slice(0, sheetCount);

  const handleSaveSession = (
    date: string,
    duration: number,
    isManual: boolean,
    justification?: string
  ) => {
    addSession(date, {
      date,
      duration,
      isManual,
      justification,
    });
  };

  const handleDeleteSession = (date: string, sessionId: string) => {
    deleteSession(date, sessionId);
  };

  const handleToggleExercise = (date: string, exerciseId: string) => {
    toggleExerciseComplete(date, exerciseId);
  };

  const handleSheetClick = () => {
    if (todayWorkoutType !== 'rest') {
      setExpandedSheet(todayWorkoutType);
    }
  };

  const handleDateClick = () => {
    // Expand today's day card and scroll to it
    toggleDayExpanded(today);
    setTimeout(() => {
      weekCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Get current week
  const currentWeek = weeks.find(w => w.isCurrent);
  const currentWeekNumber = currentWeek?.weekNumber || 1;

  // Separate weeks into past, current, and future
  const pastWeeks = weeks.filter(w => w.weekNumber < currentWeekNumber);
  const futureWeeks = weeks.filter(w => w.weekNumber > currentWeekNumber);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Today's Highlight - Most prominent */}
        <TodayHighlight 
          todayWorkoutType={todayWorkoutType} 
          workoutName={todaySheet?.name}
          isCompleted={isTodayCompleted}
          onSheetClick={handleSheetClick}
          onDateClick={handleDateClick}
        />

        {/* Stats Overview */}
        <StatsCards stats={stats} onGoalChange={updateAnnualGoal} />

        {/* Workout Sheets */}
        <WorkoutSheetsPanel 
          sheets={sheets} 
          sheetCount={sheetCount}
          expandedSheet={expandedSheet}
          onUpdateSheet={updateSheet}
          onSheetCountChange={updateSheetCount}
          onExpandSheet={setExpandedSheet}
        />

        {/* Monthly Overview */}
        <MonthlyView months={monthlyStats} currentMonth={currentMonth} />

        {/* Rest Days Configuration */}
        <RestDaysConfig restDays={restDays} onRestDaysChange={updateRestDays} />

        {/* Current Week - Fully Expanded */}
        {currentWeek && (
          <div ref={weekCardRef} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                Semana Atual
              </h2>
              <span className="text-xs sm:text-sm text-primary font-medium">
                Semana {currentWeek.weekNumber}
              </span>
            </div>
            <WeekCard
              week={currentWeek}
              expandedDay={expandedDay}
              sheets={activeSheets}
              onToggleDay={toggleDayExpanded}
              onSaveSession={handleSaveSession}
              onDeleteSession={handleDeleteSession}
              onToggleExercise={handleToggleExercise}
              formatTime={formatTime}
              formatTimeDetailed={formatTimeDetailed}
            />
          </div>
        )}

        {/* Past Weeks - Compact */}
        {pastWeeks.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-muted-foreground">
              Semanas Anteriores
            </h2>
            <div className="grid gap-2">
              {pastWeeks.map((week) => (
                <WeekCardCompact 
                  key={week.weekNumber} 
                  week={week}
                  expandedDay={expandedDay}
                  sheets={activeSheets}
                  onToggleDay={toggleDayExpanded}
                  onSaveSession={handleSaveSession}
                  onDeleteSession={handleDeleteSession}
                  onToggleExercise={handleToggleExercise}
                  formatTime={formatTime}
                  formatTimeDetailed={formatTimeDetailed}
                />
              ))}
            </div>
          </div>
        )}

        {/* Future Weeks - Compact */}
        {futureWeeks.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-muted-foreground">
              Próximas Semanas
            </h2>
            <div className="grid gap-2">
              {futureWeeks.map((week) => (
                <WeekCardCompact 
                  key={week.weekNumber} 
                  week={week}
                  expandedDay={expandedDay}
                  sheets={activeSheets}
                  onToggleDay={toggleDayExpanded}
                  onSaveSession={handleSaveSession}
                  onDeleteSession={handleDeleteSession}
                  onToggleExercise={handleToggleExercise}
                  formatTime={formatTime}
                  formatTimeDetailed={formatTimeDetailed}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};