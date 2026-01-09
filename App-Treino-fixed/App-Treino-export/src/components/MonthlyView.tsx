import { useState } from 'react';
import { ChevronDown, ChevronUp, CalendarDays } from 'lucide-react';
import { MonthlyStats } from '@/types/workout';
import { motion, AnimatePresence } from 'framer-motion';

interface MonthlyViewProps {
  months: MonthlyStats[];
  currentMonth: number;
}

export const MonthlyView = ({ months, currentMonth }: MonthlyViewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const totalCompleted = months.reduce((sum, m) => sum + m.completed, 0);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div 
        className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold">Visão por Mês</h2>
          <span className="text-xs text-muted-foreground">({totalCompleted} treinos)</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
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
            <div className="px-3 pb-3 sm:px-4 sm:pb-4">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5 sm:gap-2">
                {months.map((month) => (
                  <div
                    key={month.month}
                    className={`text-center p-2 sm:p-3 rounded-lg transition-all ${
                      month.month === currentMonth
                        ? 'border-2 border-primary bg-primary/10'
                        : 'bg-muted/50'
                    }`}
                  >
                    <p className={`text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 ${
                      month.month === currentMonth ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {month.name}
                    </p>
                    <p className={`text-sm sm:text-lg font-bold ${
                      month.month === currentMonth ? 'text-primary' : 'text-foreground'
                    }`}>
                      {month.completed}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{month.percentage}%</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
