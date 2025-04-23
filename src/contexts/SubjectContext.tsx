import React, { createContext, useContext, useState, useEffect } from 'react';
import { Subject, Schedule } from '@/types';
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

  useEffect(() => {
    if (user) {
      loadSubjects();
    } else {
      setSubjects([]);
    }
  }, [user]);

  const loadSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      const formattedData = (data || []).map(subject => {
        let schedule;
        try {
          schedule = typeof subject.schedule === 'string' 
            ? JSON.parse(subject.schedule) 
            : subject.schedule;
        } catch (e) {
          console.error('Error parsing schedule:', e);
          schedule = [];
        }

        return {
          id: subject.id,
          name: subject.name,
          color: subject.color,
          teacher: subject.teacher || undefined,
          classroom: subject.classroom || undefined,
          schedule: schedule as Schedule[]
        };
      });

      setSubjects(formattedData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al cargar materias",
        description: error.message
      });
      console.error('Error loading subjects:', error);
    }
  };

  const addSubject = async (subject: Omit<Subject, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([{ 
          name: subject.name,
          color: subject.color,
          teacher: subject.teacher,
          classroom: subject.classroom,
          schedule: JSON.stringify(subject.schedule),
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      const formattedSubject: Subject = {
        id: data.id,
        name: data.name,
        color: data.color,
        teacher: data.teacher || undefined,
        classroom: data.classroom || undefined,
        schedule: typeof data.schedule === 'string' ? JSON.parse(data.schedule) : data.schedule
      };

      setSubjects(prev => [...prev, formattedSubject]);
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
          schedule: JSON.stringify(updatedSubject.schedule)
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
