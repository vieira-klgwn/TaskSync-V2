import React from 'react'

const TeamList = () => {
    useEffect(()=> {
       
        //fetch teams
        axios.get('/api/teams')
            .then(response => setTeams(response.data))
            .catch(error => console.error('Error fetching teams:', error));



    },[])
  return (
    <>
    <h3>Teams</h3>
     <ul className="list-group">
                {teams.map(team => (
                    <li key={team.id} className="list-group-item">{team.name}
                        {user?.role === 'TEAM_LEAD' && (
                            <div>
                                <input type="number" placeholder="User ID" onChange={(e) => setMemberUserId(e.target.value)}/>
                                <button className="btn btn-primary"  onClick={() => handleAddMember(team.id,memberUserId)}>Add Member</button>
                            </div>

                        )}
                    </li>

                ))}
    </ul>
    
    </>
  )
}

export default TeamList
