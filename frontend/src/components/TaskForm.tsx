import React, { useState } from 'react';
import { Task } from '../types/task';
import { TeamMember } from '../types/teamMember';

interface TaskFormProps {
  teamMembers: TeamMember[];
  onAddTask: (task: Task) => void;
  userRole: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ teamMembers, onAddTask, userRole }) => {
  const [title, setTitle] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [status, setStatus] = useState<string>('To Do');
  const [error, setError] = useState<string | null>(null);
  
  const canAddTasks = userRole === 'TEAM_LEAD';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    
    if (!assigneeId) {
      setError('Please select an assignee');
      return;
    }
    
    if (teamMembers.length === 0) {
      setError('No team members available to assign');
      console.warn("teamMembers is empty");
      return;
    }

    console.log("Comparing assigneeId:", assigneeId, "with member IDs:", teamMembers.map(member => ({ id: member.id, type: typeof member.id })));
    const assignee = teamMembers.find(member => String(member.id) === assigneeId);
    
    if (!assignee) {
      setError('Invalid assignee selected');
      console.log("Selected assigneeId:", assigneeId, "Type:", typeof assigneeId);
      console.log("teamMembers:", teamMembers);
      return;
    }
    
    const statusMap: { [key: string]: 'TODO' | 'IN_PROGRESS' | 'DONE' } = {
      'To Do': 'TODO',
      'In Progress': 'IN_PROGRESS',
      'Done': 'DONE',
    };
    
    const newTask: Task = {
      id: '',
      title: title.trim(),
      assignee: {
        id: assignee.id.toString(), // Ensure ID is string
        firstName: assignee.firstName,
        lastName: assignee.lastName,
        email: assignee.email,
        role: assignee.role
      },
      status: statusMap[status],
      comments: [],
      createdBy: null,
      createdDate: null,
      lastModifiedBy: null,
      lastModifiedDate: null,
    };
    
    onAddTask(newTask);
    
    setTitle('');
    setAssigneeId('');
    setStatus('To Do');
    setError(null);
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Task Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teamsync-blue focus:border-teamsync-blue"
            disabled={!canAddTasks}
          />
        </div>
        <div>
          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
            Assignee
          </label>
          <select
            id="assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teamsync-blue focus:border-teamsync-blue"
            disabled={!canAddTasks}
          >
            <option value="">Select an assignee</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id.toString()}>
                {member.firstName} {member.lastName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teamsync-blue focus:border-teamsync-blue"
            disabled={!canAddTasks}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className={`w-full px-4 py-2 rounded-md text-white ${
              canAddTasks
                ? 'bg-teamsync-blue hover:bg-teamsync-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teamsync-blue'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            disabled={!canAddTasks}
          >
            Add Task
          </button>
        </div>
      </div>
      {!canAddTasks && (
        <p className="mt-2 text-sm text-gray-500">
          You need TEAM_LEAD role to add tasks.
        </p>
      )}
    </form>
  );
};

export default TaskForm;