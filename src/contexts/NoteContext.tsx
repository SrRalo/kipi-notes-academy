
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Note } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface NoteContextProps {
  notes: Note[];
  addNote: (note: Omit<Note, 'id'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
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
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (note: Omit<Note, 'id'>) => {
    const newNote: Note = {
      ...note,
      id: uuidv4(),
    };
    setNotes((prev) => [...prev, newNote]);
  };

  const updateNote = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
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
