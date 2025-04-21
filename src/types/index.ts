
export interface Subject {
  id: string;
  name: string;
  color: string;
  schedule: Schedule[];
  classroom?: string;
  teacher?: string;
}

export interface Schedule {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo, 1 = lunes, ..., 6 = sábado
  startTime: string;
  endTime: string;
}

export interface Note {
  id: string;
  subjectId: string;
  title: string;
  date: string;
  cues: string;
  notes: string;
  summary: string;
  attendance: boolean;
}

export type Day = 'domingo' | 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado';

export const dayIndexMap: Record<Day, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miércoles: 3,
  jueves: 4,
  viernes: 5,
  sábado: 6
};

export const dayNames: Day[] = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
