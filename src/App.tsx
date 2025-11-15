import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { CourseBrowser } from './components/courses/CourseBrowser';
import { CourseDetail } from './components/courses/CourseDetail';
import { CoursePlayer } from './components/player/CoursePlayer';
import { StudentDashboard } from './components/student/StudentDashboard';
import { InstructorDashboard } from './components/instructor/InstructorDashboard';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [view, setView] = useState<string>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);

  const handleNavigate = (newView: string) => {
    setView(newView);
    setSelectedCourseId(null);
    setSelectedEnrollmentId(null);
  };

  const handleCourseClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    setView('course-detail');
  };

  const handleStartLearning = (enrollmentId: string) => {
    setSelectedEnrollmentId(enrollmentId);
    setView('player');
  };

  const handleEnroll = () => {
    setView('dashboard');
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
      <Header onNavigate={handleNavigate} currentView={view} />

      {view === 'home' && (
        <div className="min-h-[calc(100vh-64px)]">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <h1 className="text-5xl font-bold mb-6">
                Learn Without Limits
              </h1>
              <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                Join thousands of students learning from expert instructors. Master new skills
                with our comprehensive courses and earn certificates.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleNavigate('courses')}
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg"
                >
                  Explore Courses
                </button>
                {!user && (
                  <button
                    onClick={() => handleNavigate('register')}
                    className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-400 transition-colors font-medium text-lg border-2 border-white"
                  >
                    Start Learning
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Courses</h3>
                <p className="text-gray-600">
                  Learn from industry experts with real-world experience
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Community</h3>
                <p className="text-gray-600">
                  Join a vibrant community of learners and instructors
                </p>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Track Progress</h3>
                <p className="text-gray-600">
                  Monitor your learning journey with detailed analytics
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Certificates</h3>
                <p className="text-gray-600">
                  Earn certificates to showcase your achievements
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'login' && (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
          <LoginForm onToggle={() => handleNavigate('register')} />
        </div>
      )}

      {view === 'register' && (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
          <RegisterForm onToggle={() => handleNavigate('login')} />
        </div>
      )}

      {view === 'courses' && <CourseBrowser onCourseClick={handleCourseClick} />}

      {view === 'course-detail' && selectedCourseId && (
        <CourseDetail
          courseId={selectedCourseId}
          onEnroll={handleEnroll}
          onStartLearning={handleStartLearning}
        />
      )}

      {view === 'player' && selectedEnrollmentId && (
        <CoursePlayer
          courseId=""
          enrollmentId={selectedEnrollmentId}
        />
      )}

      {view === 'dashboard' && profile?.role === 'student' && (
        <StudentDashboard onContinueCourse={handleStartLearning} />
      )}

      {view === 'dashboard' && profile?.role === 'instructor' && (
        <InstructorDashboard
          onCreateCourse={() => console.log('Create course')}
          onManageCourse={(courseId) => console.log('Manage course:', courseId)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
