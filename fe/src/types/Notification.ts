export type Notification = {
  id: string;
  user_id: string;
  channel: "whatsapp";
  message: string;
  sent_at?: string;
};
