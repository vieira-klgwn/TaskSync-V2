import { Task } from './task';
import { Team } from './team';

export interface Project {
  id: string;
  name: string;
  progress: number;
  description?: string;
  team: Team[]
  tasks: Task[];
  createdBy: string | null;
  createdDate: string | null;
  lastModifiedBy: string | null;
  lastModifiedDate: string | null;

}