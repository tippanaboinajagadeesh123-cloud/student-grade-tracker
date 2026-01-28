import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Grade, Student } from '../backend';

interface RecentGradesProps {
  grades: Grade[];
  students: Student[];
  isLoading: boolean;
}

export default function RecentGrades({ grades, students, isLoading }: RecentGradesProps) {
  const getStudentName = (studentId: bigint) => {
    const student = students.find((s) => s.id === studentId);
    return student?.name || 'Unknown';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 80) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Sort grades by date (most recent first) and take top 10
  const recentGrades = [...grades]
    .sort((a, b) => Number(b.createdAt - a.createdAt))
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Grades</CardTitle>
        <CardDescription>Latest grade entries across all students</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : recentGrades.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No grades recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentGrades.map((grade) => (
                  <TableRow key={Number(grade.id)}>
                    <TableCell className="font-medium">{getStudentName(grade.studentId)}</TableCell>
                    <TableCell>{grade.subject}</TableCell>
                    <TableCell>
                      <Badge className={getScoreColor(Number(grade.score))}>
                        {Number(grade.score)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {formatDate(grade.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
