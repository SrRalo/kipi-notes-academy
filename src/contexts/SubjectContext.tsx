import React, { createContext, useContext, useState, useEffect } from 'react';
import { Subject } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

interface SubjectContextProps {
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  updateSubject: (subject: Subject) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { user } = useAuth();

  // Cargar materias al iniciar y cuando cambie el usuario
  useEffect(() => {
    if (user) {
      loadSubjects();
    }
  }, [user]);

  const loadSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      setSubjects(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al cargar materias",
        description: error.message
      });
    }
  };

  const addSubject = async (subject: Omit<Subject, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([
          { 
            ...subject,
            user_id: user?.id,
            schedule: subject.schedule
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setSubjects(prev => [...prev, data]);
      toast({
        title: "Materia agregada",
        description: "La materia se ha agregado correctamente"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al agregar materia",
        description: error.message
      });
      throw error;
    }
  };

  const updateSubject = async (updatedSubject: Subject) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .update({ 
          name: updatedSubject.name,
          color: updatedSubject.color,
          teacher: updatedSubject.teacher,
          classroom: updatedSubject.classroom,
          schedule: updatedSubject.schedule
        })
        .eq('id', updatedSubject.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setSubjects(prev =>
        prev.map(subject => subject.id === updatedSubject.id ? updatedSubject : subject)
      );

      toast({
        title: "Materia actualizada",
        description: "La materia se ha actualizado correctamente"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al actualizar materia",
        description: error.message
      });
      throw error;
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setSubjects(prev => prev.filter(subject => subject.id !== id));
      toast({
        title: "Materia eliminada",
        description: "La materia se ha eliminado correctamente"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al eliminar materia",
        description: error.message
      });
      throw error;
    }
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
