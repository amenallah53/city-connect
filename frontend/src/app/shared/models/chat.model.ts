export interface ConversationSession {
  id: string;
  sessionDate: Date;
  sessionName: string;
  userId?: string;
  messages: Message[];
}

export interface Message {
  id: string;
  contenu: string;
  date: Date;
  sender: 'user' | 'bot';
}