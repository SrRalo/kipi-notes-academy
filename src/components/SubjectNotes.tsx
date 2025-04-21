
import React, { useState } from 'react';
import { Subject, Note } from '@/types';
import { useNotes } from '@/contexts/NoteContext';
import { CornellNote } from './CornellNote';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SubjectNotesProps {
  subject: Subject;
}

export const SubjectNotes: React.FC<SubjectNotesProps> = ({ subject }) => {
  const { getNotesBySubject, addNote, updateNote, deleteNote } = useNotes();
  const notes = getNotesBySubject(subject.id);
  
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);

  const handleSaveNewNote = (note: Omit<Note, 'id'>) => {
    addNote(note);
    setIsNewNoteOpen(false);
  };

  const handleUpdateNote = (note: Note) => {
    updateNote(note);
    setIsEditNoteOpen(false);
    setSelectedNote(undefined);
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    setIsEditNoteOpen(false);
    setSelectedNote(undefined);
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsEditNoteOpen(true);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'PPP', { locale: es });
    } catch (error) {
      return dateStr;
    }
  };

  // Calcular estadísticas
  const totalNotes = notes.length;
  const totalAttendances = notes.filter(note => note.attendance).length;
  const attendanceRate = totalNotes > 0 ? (totalAttendances / totalNotes) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: subject.color }}>
            {subject.name}
          </h2>
          {subject.teacher && <p className="text-muted-foreground">Profesor: {subject.teacher}</p>}
        </div>
        <Button onClick={() => setIsNewNoteOpen(true)}>Nueva Nota</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Apuntes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalNotes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Asistencias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalAttendances} de {totalNotes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tasa de Asistencia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{attendanceRate.toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4">Historial de Apuntes</h3>
      
      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay apuntes para esta materia. ¡Crea tu primera nota!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(note => (
              <Card 
                key={note.id} 
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => handleNoteClick(note)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{formatDate(note.date)}</p>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="line-clamp-3 text-sm">{note.summary || note.notes.slice(0, 100)}</p>
                </CardContent>
                <CardFooter>
                  <Badge variant={note.attendance ? "default" : "destructive"}>
                    {note.attendance ? "Asistencia" : "Falta"}
                  </Badge>
                </CardFooter>
              </Card>
            ))}
        </div>
      )}

      <CornellNote
        subjectId={subject.id}
        onSave={handleSaveNewNote}
        open={isNewNoteOpen}
        onOpenChange={setIsNewNoteOpen}
      />

      {selectedNote && (
        <CornellNote
          note={selectedNote}
          subjectId={subject.id}
          onSave={(noteData) => handleUpdateNote({ ...noteData, id: selectedNote.id })}
          onDelete={handleDeleteNote}
          open={isEditNoteOpen}
          onOpenChange={setIsEditNoteOpen}
        />
      )}
    </div>
  );
};
