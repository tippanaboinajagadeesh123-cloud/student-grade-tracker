import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetChildForParent, useGetGradesForParentChild } from '../hooks/useQueries';
import Header from '../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Award, Calendar } from 'lucide-react';

export default function ParentDashboard() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: child, isLoading: childLoading } = useGetChildForParent();
  const { data: grades = [], isLoading: gradesLoading } = useGetGradesForParentChild();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const isLoading = childLoading || gradesLoading;

  // Get a display name from principal
  const principalId = identity?.getPrincipal().toString() || '';
  const displayName = principalId ? `Parent (${principalId.slice(0, 8)}...)` : 'Parent';

  // Calculate average score
  const averageScore = grades.length > 0
    ? Math.round(grades.reduce((sum, grade) => sum + Number(grade.score), 0) / grades.length)
    : 0;

  // Get subject breakdown
  const subjectStats = grades.reduce((acc, grade) => {
    const subject = grade.subject;
    if (!acc[subject]) {
      acc[subject] = { total: 0, count: 0 };
    }
    acc[subject].total += Number(grade.score);
    acc[subject].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header onLogout={handleLogout} userName={displayName} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, Parent!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your child's academic progress
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !child ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No student linked to your account. Please contact your teacher.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Student Info Card */}
            <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{child.name}</CardTitle>
                    <CardDescription className="text-lg mt-1">Class: {child.className}</CardDescription>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Grades
                  </CardTitle>
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{grades.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Average Score
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{averageScore}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Subjects
                  </CardTitle>
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {Object.keys(subjectStats).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subject Performance */}
            {Object.keys(subjectStats).length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                  <CardDescription>Average scores by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(subjectStats).map(([subject, stats]) => {
                      const avg = Math.round(stats.total / stats.count);
                      return (
                        <div key={subject} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">{subject}</span>
                            <Badge className={getScoreColor(avg)}>{avg}%</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {stats.count} grade{stats.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Grades Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Grades</CardTitle>
                <CardDescription>Complete grade history</CardDescription>
              </CardHeader>
              <CardContent>
                {grades.length === 0 ? (
                  <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                    No grades recorded yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {grades
                          .sort((a, b) => Number(b.createdAt - a.createdAt))
                          .map((grade) => (
                            <TableRow key={Number(grade.id)}>
                              <TableCell className="font-medium">{grade.subject}</TableCell>
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
          </>
        )}
      </main>
    </div>
  );
}
