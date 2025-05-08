import { TeamMember } from './teamMember';
import { Task } from './task';

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  tasks: Task[];
  createdBy: string | null;
  createdDate: string | null;
  lastModifiedBy: string | null;
  lastModifiedDate: string | null;
}