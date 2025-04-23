import React, { useState, useEffect } from 'react';
import { Subject, dayNames, Schedule } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useSubjects } from '@/contexts/SubjectContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const hourSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7am a 8pm

interface CalendarProps {
  onSubjectClick: (subject: Subject) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ onSubjectClick }) => {
  const { subjects } = useSubjects();
  const isMobile = useIsMobile();
  const [currentDayIndex, setCurrentDayIndex] = useState(() => {
    const today = new Date().getDay();
    return today === 0 ? 1 : today; // Si es domingo (0), mostrar lunes (1)
  });

  // Función auxiliar para determinar la posición y altura de un evento del calendario
  const getSchedulePosition = (schedule: Schedule) => {
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    const startMinute = parseInt(schedule.startTime.split(':')[1]);
    const endHour = parseInt(schedule.endTime.split(':')[0]);
    const endMinute = parseInt(schedule.endTime.split(':')[1]);
    
    // Cada hora ahora ocupa 64px (h-16)
    const startPosition = ((startHour - 7) * 64) + ((startMinute / 60) * 64);
    const duration = ((endHour - startHour) * 64) + (((endMinute - startMinute) / 60) * 64);
    
    return {
      top: `${startPosition}px`,
      height: `${duration}px`,
    };
  };

  // Obtener eventos para un día y hora específica
  const getEventsForDay = (day: number) => {
    return subjects.filter(subject => 
      subject.schedule.some(schedule => schedule.day === day)
    );
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDayIndex(current => {
      if (direction === 'prev') {
        return current > 1 ? current - 1 : 6;
      } else {
        return current < 6 ? current + 1 : 1;
      }
    });
  };

  const renderDayColumns = () => {
    const daysToRender = isMobile 
      ? [dayNames[currentDayIndex]] 
      : dayNames.filter((_, index) => index > 0 && index < 7);

    return daysToRender.map((day, index) => {
      const dayIndex = isMobile ? currentDayIndex : index + 1;
      return (
        <div key={day} className="relative flex flex-col border-l border-border flex-1 min-w-[150px]">
          {/* Cabecera del día */}
          <div className="h-12 flex items-center justify-center font-medium sticky top-0 bg-card z-10 text-base">
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </div>
          
          {/* Horas */}
          <div className="flex-1 relative">
            {hourSlots.map(hour => (
              <div key={hour} className="h-16 border-t border-border" />
            ))}
            
            {/* Eventos */}
            {getEventsForDay(dayIndex).map(subject => 
              subject.schedule
                .filter(schedule => schedule.day === dayIndex)
                .map((schedule, scheduleIndex) => {
                  const position = getSchedulePosition(schedule);
                  return (
                    <div
                      key={`${subject.id}-${scheduleIndex}`}
                      className="absolute w-[95%] left-[2.5%] rounded-md p-2 overflow-hidden text-sm shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                      style={{
                        top: position.top,
                        height: position.height,
                        backgroundColor: subject.color,
                        color: 'white',
                      }}
                      onClick={() => onSubjectClick(subject)}
                    >
                      <div className="font-medium text-base">{subject.name}</div>
                      <div className="text-sm opacity-90">{schedule.startTime} - {schedule.endTime}</div>
                      {subject.classroom && (
                        <div className="text-sm opacity-90">Aula: {subject.classroom}</div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Horario Semanal</CardTitle>
          {isMobile && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDay('prev')}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDay('next')}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-[700px] overflow-auto">
          {/* Columna de horas */}
          <div className="flex-none w-20 text-right pr-4">
            <div className="h-12"></div>
            {hourSlots.map(hour => (
              <div key={hour} className="h-16 flex items-center justify-end text-base text-muted-foreground">
                {hour}:00
              </div>
            ))}
          </div>
          
          {/* Contenedor de días */}
          <div className="flex-1 flex">
            {renderDayColumns()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
