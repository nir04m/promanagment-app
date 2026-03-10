// Defines the shape of a project member returned to the client
export interface MemberResponse {
  id: string;
  userId: string;
  projectId: string;
  projectRole: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}