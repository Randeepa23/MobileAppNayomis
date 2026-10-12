import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { format } from 'date-fns';

export const AdminStudents: React.FC = () => {
  const { data: students, isLoading, error } = useQuery({
    queryKey: ['admin-students'],
    queryFn: async () => {
      const response = await apiService.getAllStudents();
      if (response.success && response.data) {
        return response.data.students;
      }
      throw new Error('Failed to fetch students');
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <p className="text-red-600">Error loading students: {(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Students Management</CardTitle>
            <CardDescription>
              {students?.length || 0} total students registered
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students && students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student.points || 0} pts</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(student.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.email?.includes('admin') ? 'destructive' : 'default'}>
                          {student.email?.includes('admin') ? 'Admin' : 'Student'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No students found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};