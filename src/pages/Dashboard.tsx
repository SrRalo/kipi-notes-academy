import React, { useState } from 'react';
import { Calendar } from '@/components/Calendar';
import { SubjectForm } from '@/components/SubjectForm';
import { SubjectNotes } from '@/components/SubjectNotes';
import { useSubjects } from '@/contexts/SubjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { Subject } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, LogOut } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Dashboard: React.FC = () => {
  const { subjects, addSubject } = useSubjects();
  const { signOut } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleAddSubject = async (subject: Omit<Subject, 'id'>) => {
    try {
      await addSubject(subject);
    } catch (error: any) {
      // El error ya se muestra en el contexto
      console.error('Error adding subject:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <header className="py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-500">Kipi</h1>
            <SubjectForm onSubmit={handleAddSubject} buttonLabel="Nueva Materia" />
          </div>
        </header>

        <main className="space-y-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <Calendar onSubjectClick={handleSubjectClick} />
            </div>
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="bg-gray-800 rounded-lg p-4 h-full">
                <h2 className="text-xl font-bold mb-4">Materias</h2>
                {subjects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No hay materias registradas</p>
                    <SubjectForm
                      onSubmit={handleAddSubject}
                      buttonLabel="Agregar Primera Materia"
                      buttonVariant="outline"
                    />
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col">
                    {subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="p-3 rounded-md cursor-pointer transition-colors hover:bg-gray-700 w-full"
                        style={{ borderLeft: `4px solid ${subject.color}` }}
                        onClick={() => handleSubjectClick(subject)}
                      >
                        <h3 className="font-medium">{subject.name}</h3>
                        {subject.teacher && (
                          <p className="text-sm text-muted-foreground">Prof. {subject.teacher}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedSubject && (
            <section className="py-4">
              <SubjectNotes 
                subject={selectedSubject} 
                onSubjectDeleted={() => setSelectedSubject(null)} 
              />
            </section>
          )}
        </main>

        <footer className="mt-8 pb-8">
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;

