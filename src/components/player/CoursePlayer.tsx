import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { VideoPlayer } from './VideoPlayer';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib/database.types';

type Lesson = Database['public']['Tables']['lessons']['Row'];
type Section = Database['public']['Tables']['course_sections']['Row'] & {
  lessons: Lesson[];
};
type LessonProgress = Database['public']['Tables']['lesson_progress']['Row'];

interface CoursePlayerProps {
  courseId: string;
  enrollmentId: string;
}

export function CoursePlayer({ courseId, enrollmentId }: CoursePlayerProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourseContent();
    loadProgress();
  }, [courseId, enrollmentId]);

  const loadCourseContent = async () => {
    try {
      const { data: sectionsData, error } = await supabase
        .from('course_sections')
        .select(`
          *,
          lessons (*)
        `)
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      const sortedSections = sectionsData.map(section => ({
        ...section,
        lessons: (section.lessons as Lesson[]).sort((a, b) => a.order_index - b.order_index)
      }));

      setSections(sortedSections);

      if (sortedSections.length > 0 && sortedSections[0].lessons.length > 0) {
        setCurrentLesson(sortedSections[0].lessons[0]);
        setExpandedSections(new Set([sortedSections[0].id]));
      }
    } catch (error) {
      console.error('Error loading course content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('enrollment_id', enrollmentId);

      if (error) throw error;

      const progressMap: Record<string, LessonProgress> = {};
      data.forEach(p => {
        progressMap[p.lesson_id] = p;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleProgressUpdate = async (lessonId: string, watchedSeconds: number, isCompleted: boolean) => {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert({
          enrollment_id: enrollmentId,
          lesson_id: lessonId,
          watched_seconds: watchedSeconds,
          is_completed: isCompleted,
          last_watched_at: new Date().toISOString(),
        }, {
          onConflict: 'enrollment_id,lesson_id'
        })
        .select()
        .single();

      if (error) throw error;

      setProgress(prev => ({
        ...prev,
        [lessonId]: data
      }));

      await updateEnrollmentProgress();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const updateEnrollmentProgress = async () => {
    try {
      const totalLessons = sections.reduce((sum, section) => sum + section.lessons.length, 0);
      const completedLessons = Object.values(progress).filter(p => p.is_completed).length;
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      const { error } = await supabase
        .from('enrollments')
        .update({
          progress_percentage: progressPercentage,
          completed_at: progressPercentage === 100 ? new Date().toISOString() : null
        })
        .eq('id', enrollmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating enrollment progress:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {currentLesson && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <VideoPlayer
                  videoUrl={currentLesson.video_url}
                  lessonId={currentLesson.id}
                  enrollmentId={enrollmentId}
                  initialProgress={progress[currentLesson.id]?.watched_seconds || 0}
                  onProgressUpdate={(watched, completed) =>
                    handleProgressUpdate(currentLesson.id, watched, completed)
                  }
                />

                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentLesson.title}
                  </h1>
                  {currentLesson.description && (
                    <p className="text-gray-600">{currentLesson.description}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Course Content</h2>
              </div>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {sections.map(section => (
                  <div key={section.id} className="border-b border-gray-200">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{section.title}</span>
                      {expandedSections.has(section.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    {expandedSections.has(section.id) && (
                      <div className="bg-gray-50">
                        {section.lessons.map(lesson => {
                          const lessonProgress = progress[lesson.id];
                          const isCompleted = lessonProgress?.is_completed || false;
                          const isCurrent = currentLesson?.id === lesson.id;

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => setCurrentLesson(lesson)}
                              className={`w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left ${
                                isCurrent ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-900'}`}>
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {Math.floor(lesson.duration_seconds / 60)} min
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
