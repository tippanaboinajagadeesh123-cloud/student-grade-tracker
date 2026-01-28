import { useState } from 'react';
import { useAddGrade } from '../hooks/useQueries';
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

interface AddGradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
}

export default function AddGradeDialog({ open, onOpenChange, students }: AddGradeDialogProps) {
  const [studentId, setStudentId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [score, setScore] = useState('');
  const addGrade = useAddGrade();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !subject.trim() || !score) {
      toast.error('Please fill in all fields');
      return;
    }

    const scoreNum = parseInt(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      toast.error('Score must be between 0 and 100');
      return;
    }

    try {
      await addGrade.mutateAsync({
        studentId: BigInt(studentId),
        subject: subject.trim(),
        score: BigInt(scoreNum),
      });
      toast.success('Grade added successfully!');
      setStudentId('');
      setSubject('');
      setScore('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add grade');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Grade</DialogTitle>
          <DialogDescription>Enter the grade information below</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger id="student">
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
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">Score (0-100)</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                placeholder="Enter score"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addGrade.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {addGrade.isPending ? 'Adding...' : 'Add Grade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
