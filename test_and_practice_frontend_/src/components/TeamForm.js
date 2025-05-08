
import React ,{useState} from 'react'
import { AuthContext } from '../context/AuthContext';

const TeamForm = () => {

    useEffect(()=> {
        
        //fetch teams
        axios.get('/api/teams')
            .then(response => setTeams(response.data))
            .catch(error => console.error('Error fetching teams:', error));



    },[])
    const [teams, setTeams] = useState([]);
    const {user} = useContext(AuthContext);
  return (
    {user?.role === 'TEAM_LEAD' && (
        <>
            <h3>Create Team</h3>
            <form onSubmit={handleCreateTeam} className="mb-4">
                <div className="form-group">
                    <input type="text" className="form-control" placeholder="Team Name" value={newTeam.name} onChange={(e) => setNewTeam({...newTeam, name: e.target.value})} required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Create Team</button>
            </form>
        </>
    )}
  )
}

export default TeamForm
