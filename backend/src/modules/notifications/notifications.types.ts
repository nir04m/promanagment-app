// Defines the shape of a notification returned to the client
export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  payload: unknown;
  isRead: boolean;
  createdAt: Date;
}