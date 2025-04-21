
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Subject, Schedule } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface SubjectContextProps {
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  getSubjectById: (id: string) => Subject | undefined;
}

const SubjectContext = createContext<SubjectContextProps | undefined>(undefined);

export const useSubjects = () => {
  const context = useContext(SubjectContext);
  if (!context) {
    throw new Error('useSubjects must be used within a SubjectProvider');
  }
  return context;
};

export const SubjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const savedSubjects = localStorage.getItem('subjects');
    return savedSubjects ? JSON.parse(savedSubjects) : [];
  });

  useEffect(() => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
  }, [subjects]);

  const addSubject = (subject: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subject,
      id: uuidv4(),
    };
    setSubjects((prev) => [...prev, newSubject]);
  };

  const updateSubject = (updatedSubject: Subject) => {
    setSubjects((prev) =>
      prev.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject))
    );
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((subject) => subject.id !== id));
  };

  const getSubjectById = (id: string) => {
    return subjects.find((subject) => subject.id === id);
  };

  return (
    <SubjectContext.Provider
      value={{
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        getSubjectById,
      }}
    >
      {children}
    </SubjectContext.Provider>
  );
};
