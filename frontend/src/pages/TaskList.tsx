import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TaskTable from '../components/TaskTable';
import TaskForm from '../components/TaskForm';
import { Task } from '../types/task';
import { TeamMember } from '../types/teamMember';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { fetchWithAuth } from '../lib/api';

const TaskList = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, accessToken, isTeamLead, refreshAuthToken, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      setLoading(true);
      try {
        const projectResponse = await fetchWithAuth(`http://localhost:8080/api/projects/${projectId}`, {}, { accessToken, refreshAuthToken, logout });
        
        if (!projectResponse.ok) {
          const errorText = await projectResponse.text();
          throw new Error(`Failed to fetch project: ${projectResponse.status} - ${errorText}`);
        }
        const projectData = await projectResponse.json();
        console.log('Project fetched:', projectData);
        setProjectName(projectData.name || 'Unnamed Project');

        const tasksResponse = await fetchWithAuth(`http://localhost:8080/api/projects/${projectId}/tasks`, {}, { accessToken, refreshAuthToken, logout });
        if (!tasksResponse.ok) {
          throw new Error(`Failed to fetch tasks: ${tasksResponse.status}`);
        }
        const tasksData = await tasksResponse.json();
        console.log('Tasks fetched:', tasksData);
        setTasks(tasksData || []);

        if (!projectData.team || !projectData.team.id) {
          console.warn('Project has no associated team');
          setTeamMembers([]);
        } else {
          const teamResponse = await fetchWithAuth(`http://localhost:8080/api/teams/${projectData.team.id}`, {}, { accessToken, refreshAuthToken, logout });
          if (!teamResponse.ok) {
            throw new Error(`Failed to fetch team members: ${teamResponse.status}`);
          }
          const teamData = await teamResponse.json();
          console.log('Team members fetched:', teamData.members);
          // Convert id to string to match TeamMember type
          const normalizedMembers = (teamData.members || []).map((member: any) => ({
            ...member,
            id: String(member.id)
          }));
          setTeamMembers(normalizedMembers);
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching project/tasks/team:', err);
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
      fetchProjectAndTasks();
    } else {
      setError('Please log in to view tasks');
      setLoading(false);
    }
  }, [projectId, accessToken, refreshAuthToken, logout, toast]);

  const handleAddTask = async (newTask: Task) => {
    try {
      const response = await fetchWithAuth(`http://localhost:8080/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          status: newTask.status.toUpperCase().replace(' ', '_'),
          assignee: newTask.assignee ? { id: newTask.assignee.id } : null,
        }),
      }, { accessToken, refreshAuthToken, logout });
      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.status}`);
      }
      const createdTask = await response.json();
      console.log('Task created:', createdTask);
      setTasks([...tasks, createdTask]);
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
    } catch (err: any) {
      console.error('Error creating task:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetchWithAuth(`http://localhost:8080/api/tasks/${taskId}`, {
        method: 'DELETE',
      }, { accessToken, refreshAuthToken, logout });
      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
      }
      setTasks(tasks.filter(task => task.id !== taskId));
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
    } catch (err: any) {
      console.error('Error deleting task:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{projectName} Tasks</h1>
      {loading && <p className="text-gray-500">Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Task</h2>
            <TaskForm
              teamMembers={teamMembers}
              onAddTask={handleAddTask}
              userRole={user?.role || 'USER'}
            />
            {!isTeamLead && (
              <p className="mt-2 text-sm text-amber-600">
                Note: Only team leads can add new tasks.
              </p>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Task List</h2>
          <TaskTable tasks={tasks} />
          {isTeamLead && tasks.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Tasks</h3>
              <ul className="space-y-2">
                {tasks.map(task => (
                  <li key={task.id} className="flex justify-between items-center">
                    <span>{task.title}</span>
                    {isTeamLead && <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskList;