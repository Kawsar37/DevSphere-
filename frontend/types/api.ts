export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
  errors?: Array<{ field?: string; message: string }>;
}

export interface SystemHealth {
  status: string;
  uptime: number;
  timestamp: string;
  database: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  skills?: string[];
  experiences?: Experience[];
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  _id?: string;
  title: string;
  company: string;
  from: string;
  to?: string;
  currentlyWorking: boolean;
  description?: string;
}

export interface Post {
  _id: string;
  authorId: string;
  author?: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
  };
  title: string;
  body: string;
  tags?: string[];
  likesCount: number;
  dislikesCount: number;
  commentCount: number;
  rankScore: number;
  userReaction?: "like" | "dislike" | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentNode {
  _id: string;
  postId: string;
  authorId: string;
  parentCommentId: string | null;
  body: string;
  likesCount: number;
  dislikesCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
  };
  replies: CommentNode[];
}
