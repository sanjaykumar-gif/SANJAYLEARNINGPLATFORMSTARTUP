import { useState, useEffect } from 'react';
import { BookOpen, Trophy, Clock, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CertificateGenerator } from '../certificates/CertificateGenerator';
import type { Database } from '../../lib/database.types';

type Enrollment = Database['public']['Tables']['enrollments']['Row'] & {
  courses?: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    profiles: { full_name: string };
  };
};

interface StudentDashboardProps {
  onContinueCourse: (enrollmentId: string) => void;
}

export function StudentDashboard({ onContinueCourse }: StudentDashboardProps) {
  const { user, profile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadEnrollments();
      loadCertificates();
    }
  }, [user]);

  const loadEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses:course_id (
            id,
            title,
            thumbnail_url,
            profiles:instructor_id (full_name)
          )
        `)
        .eq('student_id', user!.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      setEnrollments(data as Enrollment[]);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCertificates = async () => {
    try {
      const { data: enrollmentsData, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses:course_id (
            id,
            title,
            profiles:instructor_id (full_name)
          )
        `)
        .eq('student_id', user!.id)
        .not('completed_at', 'is', null);

      if (enrollError) throw enrollError;

      const { data: certsData, error: certsError } = await supabase
        .from('certificates')
        .select('*')
        .in('enrollment_id', enrollmentsData.map(e => e.id));

      if (certsError) throw certsError;

      const certsMap = new Map(certsData.map(c => [c.enrollment_id, c]));

      const completedWithCourse = enrollmentsData.map(enrollment => ({
        enrollment,
        course: enrollment.courses,
        certificate: certsMap.get(enrollment.id),
      }));

      setCertificates(completedWithCourse);
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  const handleGenerateCertificate = async (certificateDataUrl: string, enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from('certificates')
        .upsert({
          enrollment_id: enrollmentId,
          certificate_url: certificateDataUrl,
        }, {
          onConflict: 'enrollment_id'
        });

      if (error) throw error;
      await loadCertificates();
    } catch (error) {
      console.error('Error saving certificate:', error);
    }
  };

  const inProgressCourses = enrollments.filter(e => !e.completed_at);
  const completedCourses = enrollments.filter(e => e.completed_at);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedCertificate) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setSelectedCertificate(null)}
            className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </button>
          <CertificateGenerator
            studentName={profile?.full_name || ''}
            courseName={selectedCertificate.course.title}
            completionDate={selectedCertificate.enrollment.completed_at}
            instructorName={selectedCertificate.course.profiles.full_name}
            onGenerate={(dataUrl) =>
              handleGenerateCertificate(dataUrl, selectedCertificate.enrollment.id)
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
          <p className="text-gray-600">Track your progress and continue learning</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Enrolled Courses</p>
            <p className="text-3xl font-bold text-gray-900">{enrollments.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-lg p-3">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold text-gray-900">{completedCourses.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 rounded-lg p-3">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Certificates</p>
            <p className="text-3xl font-bold text-gray-900">{certificates.length}</p>
          </div>
        </div>

        {inProgressCourses.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Continue Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressCourses.map(enrollment => (
                <div
                  key={enrollment.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {enrollment.courses?.thumbnail_url ? (
                    <img
                      src={enrollment.courses.thumbnail_url}
                      alt={enrollment.courses.title}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-blue-600"></div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {enrollment.courses?.title}
                    </h3>
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${enrollment.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <button
                      onClick={() => onContinueCourse(enrollment.id)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedCourses.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Completed Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map(({ enrollment, course, certificate }) => (
                <div
                  key={enrollment.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {course?.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-green-400 to-green-600"></div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{course?.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-green-600 mb-3">
                      <Trophy className="w-4 h-4" />
                      <span>Completed</span>
                    </div>
                    <button
                      onClick={() => setSelectedCertificate({ enrollment, course })}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      {certificate ? 'View Certificate' : 'Get Certificate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {enrollments.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600">Start learning by enrolling in a course</p>
          </div>
        )}
      </div>
    </div>
  );
}
