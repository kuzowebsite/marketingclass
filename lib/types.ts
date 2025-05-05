export type CourseType = "organization" | "individual"

export type ContentType = "video" | "text" | "image" | "file"

export interface Content {
  id: string
  title: string
  type: ContentType
  data: string // base64 encoded data
  mimeType?: string
  order: number
}

export interface Lesson {
  id: string
  title: string
  description: string
  contents: Content[]
  order: number
  quiz?: Quiz
  duration?: number // minutes
}

export type CourseLevel = "beginner" | "intermediate" | "advanced"

export interface CourseRequirement {
  id: string
  text: string
}

export interface CourseInstructor {
  id: string
  name: string
  bio: string
  avatar?: string // base64 encoded image
  expertise: string[]
}

export interface CourseOutcome {
  id: string
  text: string
}

export interface Course {
  id: string
  title: string
  description: string
  price: number
  type: CourseType
  category: string
  lessons: Lesson[]
  thumbnail?: string // base64 encoded image
  createdAt: number
  updatedAt: number
  viewCount?: number
  ratingAvg?: number
  commentCount?: number
  lastViewedAt?: number
  level?: CourseLevel
  requirements?: CourseRequirement[]
  outcomes?: CourseOutcome[]
  instructor?: CourseInstructor
  totalDuration?: number // minutes
  language?: string
  featured?: boolean
  discount?: number // percentage
  tags?: string[]
  relatedCourses?: string[] // Array of course IDs
}

export interface User {
  uid: string
  email: string
  displayName?: string
  isAdmin?: boolean
  purchasedCourses?: string[] // Array of course IDs
  bookmarkedCourses?: string[] // Array of bookmarked course IDs
  progress?: Record<string, Record<string, boolean>> // courseId -> lessonId -> completed
  badges?: Badge[]
  points?: number
  referralCode?: string
  referredBy?: string
  quizResults?: Record<string, Record<string, QuizResult>> // courseId -> lessonId -> result
  darkMode?: boolean
  reminders?: Reminder[]
  photoURL?: string
  lastActive?: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: number
}

export interface CartItem {
  id: string
  title: string
  price: number
  type: CourseType
  category: string
  referralCode?: string
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  totalAmount: number
  status: "pending" | "completed" | "cancelled"
  paymentMethod:
    | "qpay"
    | "socialpay"
    | "monpay"
    | "lendmn"
    | "khanbank"
    | "golomtbank"
    | "statebank"
    | "tdbbank"
    | "xacbank"
    | "visa"
    | "mastercard"
    | "unionpay"
    | "bank"
  paymentDetails?: any
  createdAt: number
  referralCode?: string
}

// Update the Comment interface to include an optional imageUrl field
export interface Comment {
  id: string
  userId: string
  userName: string
  courseId: string
  lessonId?: string
  text: string
  rating?: number
  imageUrl?: string // Add this line for image support
  createdAt: number
}

export interface Quiz {
  id: string
  title: string
  description?: string
  questions: QuizQuestion[]
  passingScore: number
}

export interface QuizQuestion {
  id: string
  text: string
  options: QuizOption[]
  correctOptionId: string
}

export interface QuizOption {
  id: string
  text: string
}

export interface QuizResult {
  quizId: string
  score: number
  passed: boolean
  completedAt: number
  answers: Record<string, string> // questionId -> selectedOptionId
}

export interface ChatMessage {
  id: string
  userId: string
  userName: string
  courseId: string
  lessonId: string
  text: string
  createdAt: number
  isAdmin?: boolean
}

export interface Reminder {
  id: string
  userId: string
  courseId: string
  lessonId?: string
  title: string
  description?: string
  scheduledFor: number
  isCompleted: boolean
  createdAt: number
}

export interface BlogPost {
  id?: string
  title: string
  content: string
  excerpt: string
  author: string
  createdAt: number
  tags: string[]
  category: string
  coverImage?: string
  featured?: boolean
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  points: number
  completedCourses: number
  badges: number
  weeklyPoints: number
  monthlyPoints: number
  streak: number
  level: number
  profileImage: string
}

export interface ReferralReward {
  id: string
  referrerId: string
  refereeId: string
  courseId: string
  amount: number
  points: number
  createdAt: number
}

export interface Note {
  id: string
  userId: string
  courseId: string
  lessonId: string
  contentId?: string
  title: string
  text: string
  color?: string
  createdAt: number
  updatedAt: number
  isBookmarked?: boolean
}

export interface Progress {
  completed: boolean
}

export interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  testimonial: string
  avatar?: string
  rating: number
  isActive: boolean
  createdAt: number
}

export interface SiteSettings {
  siteName: string
  siteDescription: string
  logoUrl?: string
  contactInfo: {
    email: string
    phone: string
    address: string
  }
  socialLinks: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    youtube?: string
  }
  navigation?: {
    home?: string
    courses?: string
    blog?: string
    about?: string
    contact?: string
    login?: string
    register?: string
    organizations?: string
    individual?: string
    leaderboard?: string
  }
  hero?: {
    title?: string
    subtitle?: string
  }
  buttons?: {
    viewCourses?: string
    register?: string
    login?: string
  }
  footer?: {
    quickLinks?: string
    resources?: string
    contactUs?: string
    allRightsReserved?: string
  }
  testimonials?: Testimonial[]
  featuredCourses?: string[] // Course IDs
}

// New payment related types
export type PaymentStatusType = "pending" | "processing" | "success" | "failed" | "verified" | "cancelled"

export interface PaymentStatus {
  orderId: string
  status: PaymentStatusType
  message: string
  updatedAt: number
  verificationCount: number
  paidAt?: number
  verifiedAt?: number
  verifiedBy?: string
  transactionId?: string
  error?: string
}

export interface PaymentVerification {
  id?: string
  orderId: string
  userId: string
  userName?: string
  isAdmin: boolean
  method: string
  transactionId?: string
  amount: number
  notes?: string
  createdAt?: number
  status: "pending" | "approved" | "rejected"
}
