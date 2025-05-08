import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import { Task } from '../types/task';
import { Comment } from '../types/comment';
import { TeamMember } from '../types/teamMember';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { fetchWithAuth } from '../lib/api';

const TaskDetails = () => {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, accessToken, isTeamLead, refreshAuthToken, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTaskAndComments = async () => {
      setLoading(true);
      try {
        const taskResponse = await fetchWithAuth(`http://localhost:8080/api/tasks/${taskId}`, {}, { accessToken, refreshAuthToken, logout });
        if (!taskResponse.ok) {
          throw new Error('Failed to fetch task');
        }
        const taskData = await taskResponse.json();
        setTask(taskData);

        const commentsResponse = await fetchWithAuth(`http://localhost:8080/api/comments/tasks/${taskId}/comments`, {}, { accessToken, refreshAuthToken, logout });
        if (!commentsResponse.ok) {
          throw new Error('Failed to fetch comments');
        }
        const commentsData = await commentsResponse.json();
        setComments(commentsData);

        if (isTeamLead) {
          const membersResponse = await fetchWithAuth(`http://localhost:8080/api/projects/${projectId}/members`, {}, { accessToken, refreshAuthToken, logout });
          if (!membersResponse.ok) {
            throw new Error('Failed to fetch team members');
          }
          const membersData = await membersResponse.json();
          setTeamMembers(membersData);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err.message,
        });
      }
    };

    if (accessToken) {
      fetchTaskAndComments();
    } else {
      setError('Please log in to view task details');
      setLoading(false);
    }
  }, [taskId, projectId, accessToken, isTeamLead, refreshAuthToken, logout, toast]);

  const handleAddComment = async (content: string) => {
    try {
      const response = await fetchWithAuth(`http://localhost:8080/api/comments/tasks/${taskId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author: { id: user?.id } }),
      }, { accessToken, refreshAuthToken, logout });
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      const newComment = await response.json();
      setComments([...comments, newComment]);
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    }
  };

  const handleUpdateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const status = formData.get('status') as string;
    const assigneeId = formData.get('assigneeId') as string;

    // Map frontend status strings to backend-compatible values
    const statusMap: { [key: string]: 'TODO' | 'IN_PROGRESS' | 'DONE' } = {
      'To Do': 'TODO',
      'In Progress': 'IN_PROGRESS',
      'Done': 'DONE',
    };

    try {
      const response = await fetchWithAuth(`http://localhost:8080/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          status: statusMap[status],
          assignee: assigneeId ? { id: assigneeId } : null,
        }),
      }, { accessToken, refreshAuthToken, logout });
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      const updatedTask = await response.json();
      setTask(updatedTask);
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'DONE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Map backend status to frontend display format
  const displayStatus = (status: string) => {
    const displayMap: { [key: string]: string } = {
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      DONE: 'Done',
    };
    return displayMap[status] || status;
  };

  return (
    <div>
      {loading && <p className="text-gray-500">Loading task details...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && task && (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Assignee</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(task.status)}`}>
                    {displayStatus(task.status)}
                  </span>
                </p>
              </div>
            </div>
            {isTeamLead && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Update Task</h3>
                <form onSubmit={handleUpdateTask} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={task.title}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teamsync-blue"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={displayStatus(task.status)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teamsync-blue"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 mb-1">
                      Assignee
                    </label>
                    <select
                      name="assigneeId"
                      defaultValue={task.assignee?.id || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teamsync-blue"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.firstName} {member.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teamsync-blue text-white rounded-md hover:bg-teamsync-blue-dark"
                    >
                      Update Task
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Comments</h2>
            <CommentList comments={comments} />
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add a Comment</h3>
              <CommentForm onAddComment={handleAddComment} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskDetails;