// Defines the safe public shape of a user returned to the client
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Defines the shape of a user with their project role included
export interface UserWithRole extends UserProfile {
  role: string;
}