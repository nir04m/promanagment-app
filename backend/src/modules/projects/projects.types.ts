// Defines the full project shape returned to the client
export interface ProjectResponse {
  id: string;
  name: string;
  description: string | null;
  status: string;
  deadline: Date | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount?: number;
  taskCount?: number;
}