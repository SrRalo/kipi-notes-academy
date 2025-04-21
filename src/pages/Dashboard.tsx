
import React, { useState } from 'react';
import { Calendar } from '@/components/Calendar';
import { SubjectForm } from '@/components/SubjectForm';
import { SubjectNotes } from '@/components/SubjectNotes';
import { useSubjects } from '@/contexts/SubjectContext';
import { Subject } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { subjects, addSubject } = useSubjects();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleAddSubject = (subject: Omit<Subject, 'id'>) => {
    addSubject(subject);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <header className="py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-500">Note Nexus Academy</h1>
            <SubjectForm onSubmit={handleAddSubject} buttonLabel="Nueva Materia" />
          </div>
        </header>

        <main className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            <div className="lg:col-span-5">
              <Calendar onSubjectClick={handleSubjectClick} />
            </div>
            <div className="lg:col-span-2">
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
                  <div className="space-y-2">
                    {subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="p-3 rounded-md cursor-pointer transition-colors hover:bg-gray-700"
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
              <SubjectNotes subject={selectedSubject} />
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
