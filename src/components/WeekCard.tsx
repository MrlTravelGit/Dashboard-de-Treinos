import { WeekData, WorkoutSheet, SheetType } from "@/types/workout";
import { DayCard } from "./DayCard";
import { Button } from "@/components/ui/button";

interface WeekCardProps {
  week: WeekData;
  expandedDay: string | null;
  sheets: WorkoutSheet[];
  onToggleDay: (date: string) => void;
  onToggleRestDay: (date: string) => void;
  onSaveSession: (
    date: string,
    duration: number,
    isManual: boolean,
    justification?: string
  ) => void;
  onDeleteSession: (date: string, sessionId: string) => void;
  onToggleExercise: (date: string, exerciseId: string) => void;
  formatTime: (seconds: number) => string;
  formatTimeDetailed: (seconds: number) => string;
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startDay = startDate.getDate().toString().padStart(2, "0");
  const endDay = endDate.getDate().toString().padStart(2, "0");
  const startMonth = (startDate.getMonth() + 1).toString().padStart(2, "0");
  const endMonth = (endDate.getMonth() + 1).toString().padStart(2, "0");
  return `${startDay}/${startMonth} - ${endDay}/${endMonth}`;
};

export const WeekCard = ({
  week,
  expandedDay,
  sheets,
  onToggleDay,
  onToggleRestDay,
  onSaveSession,
  onDeleteSession,
  onToggleExercise,
  formatTime,
  formatTimeDetailed,
}: WeekCardProps) => {
  const completedCount = week.days.filter(
    (d) => d.completed && d.workoutType !== "rest"
  ).length;

  const totalWorkouts = week.days.filter((d) => d.workoutType !== "rest").length;

  const getSheetForDay = (workoutType: SheetType | "rest") => {
    if (workoutType === "rest") return undefined;
    return sheets.find((s) => s.type === workoutType);
  };

  return (
    <div
      className={`bg-card rounded-lg p-3 sm:p-4 border-2 transition-all ${
        week.isCurrent ? "border-primary" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span
            className={`px-2 py-1 rounded text-xs sm:text-sm font-bold ${
              week.isCurrent
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            S{week.weekNumber}
          </span>

          <span className="text-xs sm:text-sm text-muted-foreground">
            {formatDateRange(week.startDate, week.endDate)}
          </span>

          {week.isCurrent && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs bg-primary/20 text-primary border border-primary">
              Atual
            </span>
          )}
        </div>

        <div className="text-xs sm:text-sm">
          <span className="text-primary font-bold">{completedCount}</span>
          <span className="text-muted-foreground"> /{totalWorkouts}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {week.days.map((day) => {
          const date = new Date(day.date + "T12:00:00");
          const dayOfWeek = dayNames[date.getDay()];
          const displayDate = `${date.getDate().toString().padStart(2, "0")} de ${
            monthNames[date.getMonth()]
          }`;

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dayDate = new Date(day.date + "T00:00:00");
          const isToday = dayDate.getTime() === today.getTime();

          const sheet = getSheetForDay(day.workoutType);

          return (
            <div key={day.date} className="space-y-2">
              <div className="flex justify-end">
                <Button
                  variant={day.workoutType === "rest" ? "default" : "secondary"}
                  size="sm"
                  className="h-7 px-3 text-[11px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRestDay(day.date);
                  }}
                >
                  {day.workoutType === "rest"
                    ? "Remover descanso"
                    : "Marcar descanso"}
                </Button>
              </div>

              <DayCard
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
                onToggleExercise={(exerciseId) =>
                  onToggleExercise(day.date, exerciseId)
                }
                formatTime={formatTime}
                formatTimeDetailed={formatTimeDetailed}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
