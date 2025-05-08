import React, { useEffect, useState } from 'react';
import TeamTable from '../components/TeamTable';
import { Team } from '../types/team';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { fetchWithAuth } from '../lib/api';
import { User } from '../types/users';

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, isTeamLead, refreshAuthToken, logout } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchTeamsAndUsers = async () => {
      setLoading(true);
      try {
        const teamsResponse = await fetchWithAuth('http://localhost:8080/api/teams', {}, { accessToken, refreshAuthToken, logout });
        if (!teamsResponse.ok) {
          throw new Error(`Failed to fetch teams: ${teamsResponse.status} ${teamsResponse.statusText}`);
        }
        const teamsData = await teamsResponse.json();
        setTeams(teamsData);

        if (isTeamLead) {
          const usersResponse = await fetchWithAuth('http://localhost:8080/api/users', {}, { accessToken, refreshAuthToken, logout });
          if (!usersResponse.ok) {
            throw new Error(`Failed to fetch users: ${usersResponse.status} ${usersResponse.statusText}`);
          }
          const usersData = await usersResponse.json();
          setUsers(usersData);
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
      fetchTeamsAndUsers();
    } else {
      setError('Please log in to view teams');
      setLoading(false);
    }
  }, [accessToken,isTeamLead, refreshAuthToken, logout, toast]);

  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = (e.currentTarget.elements.namedItem('teamName') as HTMLInputElement).value;
    try {
      const response = await fetchWithAuth('http://localhost:8080/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }, { accessToken, refreshAuthToken, logout });
      if (!response.ok) {
        throw new Error('Failed to create team');
      }
      const newTeam = await response.json();
      setTeams([...teams, newTeam]);
      toast({
        title: 'Success',
        description: 'Team created successfully',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    }
  };

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeamId || !selectedUserId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a team and a user',
      });
      return;
    }
    try {
      const response = await fetchWithAuth(`http://localhost:8080/api/teams/${selectedTeamId}/members/${selectedUserId}`, {
        method: 'POST',
      }, { accessToken, refreshAuthToken, logout });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add member');
      }
      const updatedTeam = await response.json();
      setTeams(teams.map(team => team.id === updatedTeam.id ? updatedTeam : team));
      toast({
        title: 'Success',
        description: 'Member added successfully',
      });
      setSelectedTeamId(null);
      setSelectedUserId(null);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    }
  };

  console.log("Is Team Lead" + isTeamLead)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Teams</h1>
      {isTeamLead && (
        <>
          <form onSubmit={handleCreateTeam} className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                name="teamName"
                placeholder="Enter team name"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teamsync-blue"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-teamsync-blue text-white rounded-md hover:bg-teamsync-blue-dark"
              >
                Create Team
              </button>
            </div>
          </form>
          <form onSubmit={handleAddMember} className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Member to Team</h2>
            <div className="flex gap-4">
              <select
                value={selectedTeamId || ''}
                onChange={(e) => setSelectedTeamId(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teamsync-blue"
                required
              >
                <option value="">Select Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teamsync-blue"
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{`${user.firstName} ${user.lastName} (${user.email})`}</option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-teamsync-blue text-white rounded-md hover:bg-teamsync-blue-dark"
              >
                Add Member
              </button>
            </div>
          </form>
        </>
      )}
      {loading && <p className="text-gray-500">Loading teams...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && <TeamTable teams={teams} />}
    </div>
  );
};

export default Teams;