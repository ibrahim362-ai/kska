export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  type: string;
  title?: string;
  content?: string;
  mediaUrl?: string;
  hashtags?: string;
  isPinned: boolean;
  isTrending: boolean;
  viewCount: number;
  createdAt: string;
  user: Pick<User, 'id' | 'username' | 'fullName' | 'avatar'>;
  _count: { likes: number; comments: number };
}

export interface Vote {
  id: string;
  title: string;
  description?: string;
  voteType: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isLive: boolean;
  totalVotes: number;
  options: VoteOption[];
  creator: Pick<User, 'id' | 'username' | 'fullName' | 'avatar'>;
}

export interface VoteOption {
  id: string;
  text: string;
  imageUrl?: string;
  voteCount: number;
}

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  price: number;
  quantity: number;
  soldCount: number;
  eventDate: string;
  location?: string;
  status: string;
  creator: Pick<User, 'id' | 'username' | 'fullName'>;
}

export interface Membership {
  id: string;
  name: string;
  planType: string;
  price: number;
  duration: number;
  badgeIcon?: string;
  extraVotes: number;
  priorityTicket: boolean;
  leaderboardBoost: number;
  isActive: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  reference: string;
  transactionId?: string;
  createdAt: string;
  user: Pick<User, 'id' | 'fullName' | 'email'>;
}

export interface ManualPaymentProof {
  id: string;
  paymentId: string;
  userId: string;
  receiptUrl: string;
  senderName: string;
  senderPhone?: string;
  transactionRef?: string;
  paidAt: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  payment: Payment;
  user: Pick<User, 'id' | 'fullName' | 'email' | 'phone'>;
  reviewer?: Pick<User, 'id' | 'fullName' | 'email'>;
}

export interface ManualPaymentInstructions {
  instructions: string;
  accounts: {
    bank: { bankName: string; accountNumber: string; accountHolder: string };
    telebirr: { number: string };
    awash: { accountNumber: string; accountHolder: string };
  };
  currency: string;
}

export interface Report {
  id: string;
  reporterId: string;
  postId?: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: Pick<User, 'id' | 'username' | 'fullName'>;
  post?: Pick<Post, 'id' | 'content'>;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalVotes: number;
  totalTickets: number;
  totalRevenue: number;
  recentUsers: Pick<User, 'id' | 'fullName' | 'email' | 'role' | 'createdAt'>[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
