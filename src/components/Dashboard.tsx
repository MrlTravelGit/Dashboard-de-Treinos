import { useAuth } from "@/contexts/AuthContext";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useWorkoutSheets } from "@/hooks/useWorkoutSheets";

import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "./DashboardSkeleton";

import { TodayHighlight } from "./TodayHighlight";
import { WeekCard } from "./WeekCard";
import { WorkoutSheetsPanel } from "./WorkoutSheetsPanel";

export function Dashboard() {
  const { signOut } = useAuth();

  const workouts = useWorkouts();
  const sheetsHook = useWorkoutSheets();

  const isLoading = workouts.loading || sheetsHook.loading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const todayDate = new Date().toISOString().split("T")[0];
  const today = workouts.getDayData(todayDate);
  

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard de Treinos</h1>

        <Button variant="outline" onClick={signOut}>
          Sair
        </Button>
      </div>

      {/* Destaque do dia */}
      {today && (
        <TodayHighlight
          todayWorkoutType={today.workoutType}
          workoutName={
            today.workoutType !== "rest"
              ? sheetsHook.sheets.find(s => s.type === today.workoutType)?.name
              : undefined
          }
          isCompleted={today.completed}
          onDateClick={() => workouts.toggleDayExpanded(today.date)}
          onSheetClick={() => {
            if (today.workoutType !== "rest") {
              sheetsHook.onExpandSheet(today.workoutType);
            }
          }}
        />
      )}

      {/* Painel de fichas */}
      <WorkoutSheetsPanel
        sheets={sheetsHook.sheets}
        sheetCount={workouts.sheetCount}
        expandedSheet={sheetsHook.expandedSheet}
        onUpdateSheet={sheetsHook.updateSheet}
        onSheetCountChange={workouts.updateSheetCount}
        onExpandSheet={sheetsHook.onExpandSheet}
      />

      {/* Semanas */}
      <div className="space-y-4">
        {workouts.weeks.map((week) => (
          <WeekCard
            key={week.weekNumber}
            week={week}
            expandedDay={workouts.expandedDay}
            sheets={sheetsHook.sheets}
            onToggleDay={workouts.toggleDayExpanded}
            onToggleRestDay={workouts.toggleRestDay}
            onSaveSession={workouts.addSession}
            onDeleteSession={workouts.deleteSession}
            onToggleExercise={workouts.toggleExerciseComplete}
            formatTime={workouts.formatTime}
            formatTimeDetailed={workouts.formatTimeDetailed}
          />
        ))}
      </div>
    </div>
  );
}
