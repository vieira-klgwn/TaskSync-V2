import { TeamMember } from './teamMember';
import { Comment } from './comment';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate?: string;
  assignee: TeamMember | null;
  comments: Comment[];
  createdBy: string | null;
  createdDate: string | null;
  lastModifiedBy: string | null;
  lastModifiedDate: string | null;
  project?: { id: string }; // Added to match backend response
}

