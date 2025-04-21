import React, { useState } from 'react';
import { Note } from '@/types';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { useSubjects } from '@/contexts/SubjectContext';

interface CornellNoteProps {
  note?: Note;
  subjectId: string;
  onSave: (note: Omit<Note, 'id'>) => void;
  onDelete?: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CornellNote: React.FC<CornellNoteProps> = ({
  note,
  subjectId,
  onSave,
  onDelete,
  open,
  onOpenChange,
}) => {
  const { getSubjectById } = useSubjects();
  const subject = getSubjectById(subjectId);

  const today = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState(note?.title || (subject ? `Apuntes de ${subject.name}` : ''));
  const [date, setDate] = useState(note?.date || today);
  const [cues, setCues] = useState(note?.cues || '');
  const [notes, setNotes] = useState(note?.notes || '');
  const [summary, setSummary] = useState(note?.summary || '');
  const [attendance, setAttendance] = useState<boolean>(note?.attendance ?? true);

  const handleSave = () => {
    onSave({
      subjectId,
      title,
      date,
      cues,
      notes,
      summary,
      attendance,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (note && onDelete) {
      onDelete(note.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{note ? 'Editar Nota' : 'Nueva Nota'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Título</Label>
              <input
                id="title"
                className="w-full p-2 rounded-md border border-border bg-background"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date">Fecha</Label>
              <input
                id="date"
                type="date"
                className="w-full p-2 rounded-md border border-border bg-background"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="attendance" 
              checked={attendance} 
              onCheckedChange={(checked) => setAttendance(checked as boolean)}
            />
            <Label htmlFor="attendance">Asistí a esta clase</Label>
          </div>

          <div className="cornell-note min-h-[500px]">
            <div className="cornell-header flex items-center justify-between p-4 border-b">
              <div>
                <strong>Materia:</strong> {subject?.name || 'Sin materia'}
              </div>
              <div className="flex items-center space-x-2">
                <span><strong>Fecha:</strong> {date}</span>
              </div>
            </div>
            
            <div className="cornell-cues">
              <Label htmlFor="cues" className="text-lg font-semibold mb-2 block">Ideas Clave</Label>
              <Textarea
                id="cues"
                className="min-h-[420px] w-full resize-none bg-transparent"
                placeholder="Escribe palabras clave, preguntas y puntos principales..."
                value={cues}
                onChange={(e) => setCues(e.target.value)}
              />
            </div>

            <div className="cornell-notes">
              <Label htmlFor="notes" className="text-lg font-semibold mb-2 block">Notas</Label>
              <Textarea
                id="notes"
                className="min-h-[420px] w-full resize-none bg-transparent"
                placeholder="Escribe tus apuntes detallados aquí..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="cornell-summary space-y-4">
              <Label htmlFor="summary" className="text-lg font-semibold mb-2 block">Resumen</Label>
              <Textarea
                id="summary"
                className="min-h-[100px] w-full resize-none bg-transparent"
                placeholder="Escribe un resumen de lo aprendido..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
              <div className="flex justify-between mt-4">
                <div>
                  {note && onDelete && (
                    <Button variant="destructive" onClick={handleDelete}>
                      Eliminar Nota
                    </Button>
                  )}
                </div>
                <Button onClick={handleSave}>
                  {note ? 'Guardar Cambios' : 'Guardar Nota'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
