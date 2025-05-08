import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectTable from '../components/ProjectTable';
import { Project } from '../types/project';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { fetchWithAuth } from '../lib/api';

const ProjectList = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamName, setTeamName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, isTeamLead, refreshAuthToken, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTeamAndProjects = async () => {
      setLoading(true);
      try {
        const teamResponse = await fetchWithAuth(`http://localhost:8080/api/teams/${teamId}`, {}, { accessToken, refreshAuthToken, logout });
        if (!teamResponse.ok) {
          throw new Error('Failed to fetch team');
        }
        const teamData = await teamResponse.json();
        setTeamName(teamData.name);

        const projectsResponse = await fetchWithAuth(`http://localhost:8080/api/projects/teams/${teamId}/projects`, {}, { accessToken, refreshAuthToken, logout });
        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch projects');
        }
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
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
      fetchTeamAndProjects();
    } else {
      setError('Please log in to view projects');
      setLoading(false);
    }
  }, [teamId, accessToken, refreshAuthToken, logout, toast]);

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = (e.currentTarget.elements.namedItem('projectName') as HTMLInputElement).value;
    try {
      const response = await fetchWithAuth('http://localhost:8080/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, team: { id: teamId } }),
      }, { accessToken, refreshAuthToken, logout });
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      const newProject = await response.json();
      setProjects([...projects, newProject]);
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    }
  };

  return (
    <div>
      <div className="flex items-center gap-x-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{teamName} Projects</h1>
      </div>
      {isTeamLead && (
        <form onSubmit={handleCreateProject} className="mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              name="projectName"
              placeholder="Enter project name"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teamsync-blue"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-teamsync-blue text-white rounded-md hover:bg-teamsync-blue-dark"
            >
              Create Project
            </button>
          </div>
        </form>
      )}
      {loading && <p className="text-gray-500">Loading projects...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && <ProjectTable projects={projects} />}
    </div>
  );
};

export default ProjectList;