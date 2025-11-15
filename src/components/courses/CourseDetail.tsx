import { useState, useEffect } from 'react';
import { Clock, Users, Star, Award, CheckCircle, Play } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib/database.types';

type Course = Database['public']['Tables']['courses']['Row'] & {
  profiles?: { full_name: string };
  reviews?: { rating: number; comment: string; profiles: { full_name: string } }[];
  enrollments?: { id: string }[];
  course_sections?: {
    id: string;
    title: string;
    lessons: { id: string; title: string; duration_seconds: number }[];
  }[];
};

interface CourseDetailProps {
  courseId: string;
  onEnroll: (courseId: string) => void;
  onStartLearning: (enrollmentId: string) => void;
}

export function CourseDetail({ courseId, onEnroll, onStartLearning }: CourseDetailProps) {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourseDetails();
    if (user) {
      checkEnrollment();
    }
  }, [courseId, user]);

  const loadCourseDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:instructor_id (full_name),
          reviews (
            rating,
            comment,
            profiles:student_id (full_name)
          ),
          enrollments (id),
          course_sections (
            id,
            title,
            lessons (id, title, duration_seconds)
          )
        `)
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourse(data as Course);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', user!.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) throw error;
      setEnrollment(data);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user || !course) return;

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: course.id,
        })
        .select()
        .single();

      if (error) throw error;
      setEnrollment(data);
      onEnroll(course.id);
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Course not found</p>
      </div>
    );
  }

  const averageRating = course.reviews && course.reviews.length > 0
    ? (course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length).toFixed(1)
    : null;

  const enrollmentCount = course.enrollments?.length || 0;

  const totalLessons = course.course_sections?.reduce(
    (sum, section) => sum + (section.lessons?.length || 0),
    0
  ) || 0;

  const totalDuration = course.course_sections?.reduce(
    (sum, section) =>
      sum +
      (section.lessons?.reduce((lessonSum, lesson) => lessonSum + lesson.duration_seconds, 0) || 0),
    0
  ) || 0;

  const totalHours = Math.floor(totalDuration / 3600);
  const totalMinutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <span className="text-sm font-semibold text-blue-400 mb-2 inline-block">
                {course.category}
              </span>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-gray-300 mb-6">{course.description}</p>

              <div className="flex items-center gap-6 text-sm">
                {averageRating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{averageRating}</span>
                    <span className="text-gray-400">({course.reviews?.length} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{enrollmentCount} students</span>
                </div>
              </div>

              {course.profiles && (
                <p className="mt-4 text-gray-300">
                  Created by <span className="font-semibold">{course.profiles.full_name}</span>
                </p>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white text-gray-900 rounded-lg shadow-xl p-6 sticky top-4">
                <div className="text-3xl font-bold mb-4">${course.price.toFixed(2)}</div>

                {enrollment ? (
                  <button
                    onClick={() => onStartLearning(enrollment.id)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Continue Learning
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Enroll Now
                  </button>
                )}

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span>
                      {totalHours}h {totalMinutes}m on-demand video
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                    <span>{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-gray-600" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Content</h2>
              <div className="space-y-4">
                {course.course_sections?.map((section, index) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50">
                      <h3 className="font-semibold text-gray-900">
                        Section {index + 1}: {section.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {section.lessons?.length || 0} lessons
                      </p>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {section.lessons?.map((lesson) => (
                        <div key={lesson.id} className="p-4 flex items-center justify-between">
                          <span className="text-gray-900">{lesson.title}</span>
                          <span className="text-sm text-gray-600">
                            {Math.floor(lesson.duration_seconds / 60)} min
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {course.reviews && course.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Reviews</h2>
                <div className="space-y-4">
                  {course.reviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium text-gray-900">{review.profiles.full_name}</span>
                      </div>
                      {review.comment && <p className="text-gray-600">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Course Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Level:</span>
                  <span className="ml-2 font-medium text-gray-900">{course.level}</span>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-medium text-gray-900">{course.category}</span>
                </div>
                <div>
                  <span className="text-gray-600">Students Enrolled:</span>
                  <span className="ml-2 font-medium text-gray-900">{enrollmentCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
