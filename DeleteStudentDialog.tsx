import { useDeleteStudent } from '../hooks/useQueries';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { Student } from '../backend';

interface DeleteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
}

export default function DeleteStudentDialog({ open, onOpenChange, student }: DeleteStudentDialogProps) {
  const deleteStudent = useDeleteStudent();

  const handleDelete = async () => {
    try {
      await deleteStudent.mutateAsync(student.id);
      toast.success('Student deleted successfully!');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete student');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Student</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{student.name}</strong>? This action cannot be undone and will also delete all associated grades.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteStudent.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteStudent.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
