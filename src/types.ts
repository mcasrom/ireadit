export interface BookReview {
  id: string;
  title: string;
  author: string;
  rating: number; // 1 to 5
  comment: string;
  recommendation: string; // "lo aconsejable"
  emoji: string;          // emoji comment/reaction
  repeat: boolean;        // "repetiría" (true/false)
  likes: number;          // likes count
  dislikes: number;       // dislikes count
  category: string;       // auto-categorized by AI (e.g., IA, Linux, Soft, Rss, Novela...)
  coverColor: string;     // aesthetic color theme for the cover card
  aiSummary: string;      // short AI-generated micro-summary of the rating/insight
  timestamp: string;      // ISO string
  editToken: string;      // user token generated client-side to edit/delete their own post (GDPR self-service)
  isFlagged?: boolean;    // post flagged/moderated
  isOnHold?: boolean;     // on hold by OSINT/Moderation due to language or veracity
  moderationReason?: string; // why it was put on hold or flagged
  gutenbergId?: number;   // ID from project Gutenberg index
  gutenbergLink?: string; // URL link to Gutenberg info
  gutenbergTextLink?: string; // URL link to direct downlodeable text/HTML report
  language?: string;      // Book's written language code (es, en)
}

export interface BookStats {
  totalBooks: number;
  mostReadTitle: string;
  mostReadCount: number;
  averageRating: number;
  categoryDistribution: { name: string; value: number }[];
}

export interface GDPRRequest {
  id: string;
  type: 'erasure' | 'info';
  targetBookTitle: string;
  userEmail: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'resolved';
}

export interface CaptchaData {
  id: string;
  question: string;
  answer: string;
}
