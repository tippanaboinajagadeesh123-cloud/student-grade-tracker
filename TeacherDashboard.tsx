import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetAllStudents, useGetAllGrades } from '../hooks/useQueries';
import Header from '../components/Header';
import DashboardStats from '../components/DashboardStats';
import StudentList from '../components/StudentList';
import RecentGrades from '../components/RecentGrades';
import AddStudentDialog from '../components/AddStudentDialog';
import AddGradeDialog from '../components/AddGradeDialog';
import ManageParentsDialog from '../components/ManageParentsDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, BookOpen } from 'lucide-react';

export default function TeacherDashboard() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: students = [], isLoading: studentsLoading } = useGetAllStudents();
  const { data: grades = [], isLoading: gradesLoading } = useGetAllGrades();

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [showManageParents, setShowManageParents] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const isLoading = studentsLoading || gradesLoading;

  // Get a display name from principal
  const principalId = identity?.getPrincipal().toString() || '';
  const displayName = principalId ? `Teacher (${principalId.slice(0, 8)}...)` : 'Teacher';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header onLogout={handleLogout} userName={displayName} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, Teacher!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your students and track their academic progress
          </p>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats students={students} grades={grades} isLoading={isLoading} />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={() => setShowAddStudent(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
          <Button
            onClick={() => setShowAddGrade(true)}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Add Grade
          </Button>
          <Button
            onClick={() => setShowManageParents(true)}
            variant="outline"
            className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Parents
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border shadow-sm">
            <TabsTrigger value="students" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="grades" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">
              <BookOpen className="w-4 h-4 mr-2" />
              Recent Grades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <StudentList students={students} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="grades">
            <RecentGrades grades={grades} students={students} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <AddStudentDialog open={showAddStudent} onOpenChange={setShowAddStudent} />
      <AddGradeDialog open={showAddGrade} onOpenChange={setShowAddGrade} students={students} />
      <ManageParentsDialog open={showManageParents} onOpenChange={setShowManageParents} students={students} />
    </div>
  );
}
