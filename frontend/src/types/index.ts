export type UserRole = 'admin' | 'usuario';
export type TicketStatus = 'por_hacer' | 'en_progreso' | 'review' | 'bloqueado' | 'listo';
export type TicketPriority = 'baja' | 'media' | 'alta';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  createdBy: User;
  assignedTo: User | null;
  labels: Label[];
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  user: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearSession: () => void;
}

export interface TicketFilters {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  labels?: string[];
  assignedTo?: string;
  createdFrom?: string;
  createdTo?: string;
  search?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
