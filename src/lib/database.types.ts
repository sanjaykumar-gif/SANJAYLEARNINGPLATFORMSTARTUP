export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'student' | 'instructor';
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: 'student' | 'instructor';
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'student' | 'instructor';
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          instructor_id: string;
          title: string;
          description: string;
          thumbnail_url: string | null;
          price: number;
          level: 'Beginner' | 'Intermediate' | 'Advanced';
          category: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          instructor_id: string;
          title: string;
          description: string;
          thumbnail_url?: string | null;
          price?: number;
          level?: 'Beginner' | 'Intermediate' | 'Advanced';
          category: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          instructor_id?: string;
          title?: string;
          description?: string;
          thumbnail_url?: string | null;
          price?: number;
          level?: 'Beginner' | 'Intermediate' | 'Advanced';
          category?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_sections: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          section_id: string;
          title: string;
          description: string | null;
          video_url: string;
          duration_seconds: number;
          order_index: number;
          is_preview: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          title: string;
          description?: string | null;
          video_url: string;
          duration_seconds?: number;
          order_index: number;
          is_preview?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          title?: string;
          description?: string | null;
          video_url?: string;
          duration_seconds?: number;
          order_index?: number;
          is_preview?: boolean;
          created_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          enrolled_at: string;
          completed_at: string | null;
          progress_percentage: number;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          enrolled_at?: string;
          completed_at?: string | null;
          progress_percentage?: number;
        };
        Update: {
          id?: string;
          student_id?: string;
          course_id?: string;
          enrolled_at?: string;
          completed_at?: string | null;
          progress_percentage?: number;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          enrollment_id: string;
          lesson_id: string;
          watched_seconds: number;
          is_completed: boolean;
          last_watched_at: string;
        };
        Insert: {
          id?: string;
          enrollment_id: string;
          lesson_id: string;
          watched_seconds?: number;
          is_completed?: boolean;
          last_watched_at?: string;
        };
        Update: {
          id?: string;
          enrollment_id?: string;
          lesson_id?: string;
          watched_seconds?: number;
          is_completed?: boolean;
          last_watched_at?: string;
        };
      };
      certificates: {
        Row: {
          id: string;
          enrollment_id: string;
          certificate_url: string | null;
          issued_at: string;
        };
        Insert: {
          id?: string;
          enrollment_id: string;
          certificate_url?: string | null;
          issued_at?: string;
        };
        Update: {
          id?: string;
          enrollment_id?: string;
          certificate_url?: string | null;
          issued_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          course_id: string;
          student_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          student_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          student_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
