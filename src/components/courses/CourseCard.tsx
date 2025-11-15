import { Clock, Users, Star } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Course = Database['public']['Tables']['courses']['Row'] & {
  profiles?: { full_name: string };
  reviews?: { rating: number }[];
  enrollments?: { id: string }[];
};

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  const averageRating = course.reviews && course.reviews.length > 0
    ? (course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length).toFixed(1)
    : null;

  const enrollmentCount = course.enrollments?.length || 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
    >
      {course.thumbnail_url ? (
        <img
          src={course.thumbnail_url}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
          <span className="text-white text-4xl font-bold">
            {course.title.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {course.level}
          </span>
          <span className="text-xs text-gray-500">{course.category}</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {course.description}
        </p>

        {course.profiles && (
          <p className="text-sm text-gray-700 mb-3">
            by {course.profiles.full_name}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-3">
            {averageRating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{averageRating}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{enrollmentCount}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <span className="text-2xl font-bold text-gray-900">
            ${course.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
