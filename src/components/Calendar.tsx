
import React from 'react';
import { Subject, dayNames, Schedule } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useSubjects } from '@/contexts/SubjectContext';

const hourSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7am a 8pm

interface CalendarProps {
  onSubjectClick: (subject: Subject) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ onSubjectClick }) => {
  const { subjects } = useSubjects();
  
  // Función auxiliar para determinar la posición y altura de un evento del calendario
  const getSchedulePosition = (schedule: Schedule) => {
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    const startMinute = parseInt(schedule.startTime.split(':')[1]);
    const endHour = parseInt(schedule.endTime.split(':')[0]);
    const endMinute = parseInt(schedule.endTime.split(':')[1]);
    
    const startPosition = (startHour - 7) * 60 + startMinute;
    const duration = (endHour - startHour) * 60 + (endMinute - startMinute);
    
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

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-2xl">Horario Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-1 h-[600px] overflow-auto">
          {/* Columna de horas */}
          <div className="flex flex-col text-right pr-2">
            <div className="h-10"></div> {/* Espacio para cabecera */}
            {hourSlots.map(hour => (
              <div key={hour} className="h-12 flex items-center justify-end text-sm text-muted-foreground">
                {hour}:00
              </div>
            ))}
          </div>
          
          {/* Columnas de días */}
          {dayNames.filter((_, index) => index > 0 && index < 7).map((day, index) => (
            <div key={day} className="relative flex flex-col border-l border-border">
              {/* Cabecera del día */}
              <div className="h-10 flex items-center justify-center font-medium sticky top-0 bg-card z-10">
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </div>
              
              {/* Horas */}
              <div className="flex-1 relative">
                {hourSlots.map(hour => (
                  <div key={hour} className="h-12 border-t border-border" />
                ))}
                
                {/* Eventos */}
                {getEventsForDay(index + 1).map(subject => 
                  subject.schedule
                    .filter(schedule => schedule.day === index + 1)
                    .map((schedule, scheduleIndex) => {
                      const position = getSchedulePosition(schedule);
                      return (
                        <div
                          key={`${subject.id}-${scheduleIndex}`}
                          className="absolute w-[95%] left-[2.5%] rounded-md p-1 overflow-hidden text-sm shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          style={{
                            top: position.top,
                            height: position.height,
                            backgroundColor: subject.color,
                            color: 'white',
                          }}
                          onClick={() => onSubjectClick(subject)}
                        >
                          <div className="font-medium">{subject.name}</div>
                          <div className="text-xs opacity-90">{schedule.startTime} - {schedule.endTime}</div>
                          {subject.classroom && (
                            <div className="text-xs opacity-90">Aula: {subject.classroom}</div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
