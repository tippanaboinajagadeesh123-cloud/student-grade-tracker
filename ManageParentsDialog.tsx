import { useState } from 'react';
import { useLinkParentToStudent } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { Student } from '../backend';

interface ManageParentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
}

export default function ManageParentsDialog({ open, onOpenChange, students }: ManageParentsDialogProps) {
  const [parentPrincipal, setParentPrincipal] = useState('');
  const [studentId, setStudentId] = useState<string>('');
  const linkParent = useLinkParentToStudent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentPrincipal.trim() || !studentId) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await linkParent.mutateAsync({
        parentPrincipal: parentPrincipal.trim(),
        studentId: BigInt(studentId),
      });
      toast.success('Parent linked to student successfully!');
      setParentPrincipal('');
      setStudentId('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to link parent');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Parent to Student</DialogTitle>
          <DialogDescription>
            Connect a parent's Internet Identity to their child's account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="principal">Parent's Principal ID</Label>
              <Input
                id="principal"
                placeholder="Enter parent's principal ID"
                value={parentPrincipal}
                onChange={(e) => setParentPrincipal(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The parent must provide their principal ID after logging in
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-select">Student</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger id="student-select">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={Number(student.id)} value={student.id.toString()}>
                      {student.name} - {student.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={linkParent.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {linkParent.isPending ? 'Linking...' : 'Link Parent'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
