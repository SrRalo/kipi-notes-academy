import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Subject, Schedule, dayIndexMap } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

// Predefined colors for subjects
const SUBJECT_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#6366F1', // indigo-500
  '#0EA5E9', // sky-500
  '#14B8A6', // teal-500
  '#F97316', // orange-500
];

const scheduleSchema = z.object({
  day: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

const subjectSchema = z.object({
  name: z.string().min(1, { message: 'El nombre de la materia es obligatorio' }),
  classroom: z.string().optional(),
  teacher: z.string().optional(),
  color: z.string(),
  schedules: z.array(scheduleSchema).min(1, { message: 'Debe agregar al menos un horario' }),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  onSubmit: (subject: Omit<Subject, 'id'>) => void;
  initialData?: Subject;
  buttonLabel?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  open?: boolean;
  setOpen?: (open: boolean) => void;
  onDelete?: () => void;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({
  onSubmit,
  initialData,
  buttonLabel = 'Nueva Materia',
  buttonVariant = 'default',
  open: controlledOpen,
  setOpen: setControlledOpen,
  onDelete
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: initialData 
      ? {
          name: initialData.name,
          classroom: initialData.classroom || '',
          teacher: initialData.teacher || '',
          color: initialData.color,
          schedules: initialData.schedule.map(s => ({
            day: s.day.toString(),
            startTime: s.startTime,
            endTime: s.endTime,
          })),
        }
      : {
          name: '',
          classroom: '',
          teacher: '',
          color: SUBJECT_COLORS[0],
          schedules: [{ day: '1', startTime: '08:00', endTime: '10:00' }],
        },
  });

  const handleSubmit = (values: SubjectFormValues) => {
    const subject: Omit<Subject, 'id'> = {
      name: values.name,
      classroom: values.classroom || undefined,
      teacher: values.teacher || undefined,
      color: values.color,
      schedule: values.schedules.map(s => ({
        day: Number(s.day) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    };
    onSubmit(subject);
    setOpen(false);
    form.reset();
  };

  const addSchedule = () => {
    const schedules = form.getValues('schedules');
    form.setValue('schedules', [...schedules, { day: '1', startTime: '08:00', endTime: '10:00' }]);
  };

  const removeSchedule = (index: number) => {
    const schedules = form.getValues('schedules');
    if (schedules.length > 1) {
      form.setValue(
        'schedules',
        schedules.filter((_, i) => i !== index)
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant}>{buttonLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar' : 'Agregar'} Materia</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Materia*</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classroom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aula</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profesor</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="grid grid-cols-5 gap-2">
                    {SUBJECT_COLORS.map((color) => (
                      <div
                        key={color}
                        className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                          field.value === color ? 'border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => form.setValue('color', color)}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Horario*</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSchedule}>
                  Agregar Horario
                </Button>
              </div>

              {form.watch('schedules').map((_, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <FormField
                      control={form.control}
                      name={`schedules.${index}.day`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Día</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Día" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Lunes</SelectItem>
                              <SelectItem value="2">Martes</SelectItem>
                              <SelectItem value="3">Miércoles</SelectItem>
                              <SelectItem value="4">Jueves</SelectItem>
                              <SelectItem value="5">Viernes</SelectItem>
                              <SelectItem value="6">Sábado</SelectItem>
                              <SelectItem value="0">Domingo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`schedules.${index}.startTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inicio</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`schedules.${index}.endTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fin</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeSchedule(index)}
                      disabled={form.watch('schedules').length <= 1}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="flex-col gap-2">
              <Button type="submit" className="w-full">{initialData ? 'Guardar Cambios' : 'Agregar Materia'}</Button>
              {initialData && onDelete && (
                <>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Eliminar Materia
                  </Button>

                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará la materia y todas sus notas asociadas. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                          onDelete();
                          setShowDeleteDialog(false);
                          setOpen(false);
                        }}>
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
