import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface RestDaysConfigProps {
  restDays: number[];
  onRestDaysChange: (days: number[]) => void;
}

const dayNames = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

export const RestDaysConfig = ({ restDays, onRestDaysChange }: RestDaysConfigProps) => {
  const toggleDay = (day: number) => {
    if (restDays.includes(day)) {
      onRestDaysChange(restDays.filter(d => d !== day));
    } else {
      onRestDaysChange([...restDays, day]);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          Dias de Descanso
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-4">
        <div className="flex flex-wrap gap-3">
          {dayNames.map((day) => (
            <div key={day.value} className="flex items-center gap-1.5">
              <Checkbox
                id={`rest-day-${day.value}`}
                checked={restDays.includes(day.value)}
                onCheckedChange={() => toggleDay(day.value)}
              />
              <Label
                htmlFor={`rest-day-${day.value}`}
                className="text-xs sm:text-sm cursor-pointer"
              >
                {day.label}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
