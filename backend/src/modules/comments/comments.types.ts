// Defines the shape of a comment returned to the client
export interface CommentResponse {
  id: string;
  content: string;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}