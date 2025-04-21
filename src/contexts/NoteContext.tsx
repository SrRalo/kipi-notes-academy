import React, { createContext, useContext, useState, useEffect } from 'react';
import { Note } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

interface NoteContextProps {
  notes: Note[];
  addNote: (note: Omit<Note, 'id'>) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNoteById: (id: string) => Note | undefined;
  getNotesBySubject: (subjectId: string) => Note[];
}

const NoteContext = createContext<NoteContextProps | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotes();
    } else {
      setNotes([]);
    }
  }, [user]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      const formattedNotes = data.map(note => ({
        id: note.id,
        subjectId: note.subject_id,
        title: note.title,
        date: note.date,
        cues: note.cues || '',
        notes: note.notes || '',
        summary: note.summary || '',
        attendance: note.attendance || false
      }));

      setNotes(formattedNotes);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al cargar notas",
        description: error.message
      });
    }
  };

  const addNote = async (note: Omit<Note, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            title: note.title,
            date: note.date,
            cues: note.cues || '',
            notes: note.notes || '',
            summary: note.summary || '',
            attendance: note.attendance,
            subject_id: note.subjectId,
            user_id: user?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const formattedNote: Note = {
        id: data.id,
        subjectId: data.subject_id,
        title: data.title,
        date: data.date,
        cues: data.cues || '',
        notes: data.notes || '',
        summary: data.summary || '',
        attendance: data.attendance || false
      };

      setNotes(prev => [...prev, formattedNote]);
      toast({
        title: "Nota guardada",
        description: "La nota se ha guardado correctamente"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al guardar nota",
        description: error.message
      });
      throw error;
    }
  };

  const updateNote = async (updatedNote: Note) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: updatedNote.title,
          date: updatedNote.date,
          cues: updatedNote.cues || '',
          notes: updatedNote.notes || '',
          summary: updatedNote.summary || '',
          attendance: updatedNote.attendance,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedNote.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotes(prev =>
        prev.map(note => note.id === updatedNote.id ? updatedNote : note)
      );
      
      toast({
        title: "Nota actualizada",
        description: "La nota se ha actualizado correctamente"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al actualizar nota",
        description: error.message
      });
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
      toast({
        title: "Nota eliminada",
        description: "La nota se ha eliminado correctamente"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al eliminar nota",
        description: error.message
      });
      throw error;
    }
  };

  const getNoteById = (id: string) => {
    return notes.find((note) => note.id === id);
  };

  const getNotesBySubject = (subjectId: string) => {
    return notes.filter((note) => note.subjectId === subjectId);
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        addNote,
        updateNote,
        deleteNote,
        getNoteById,
        getNotesBySubject,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};
