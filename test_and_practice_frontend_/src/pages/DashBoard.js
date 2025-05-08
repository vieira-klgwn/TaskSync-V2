import React, {useState,useEffect,useContext} from "react";
import axios from "axios";
import {AuthContext} from "../context/AuthContext";



const Dashboard = () => {
    const {user} = useContext(AuthContext)
    const [tasks, setTasks] = useState([]);
    const [teams, setTeams] = useState([]);
    const [newTask, setNewTask] = useState({title: '',description:'',status:'TODO',dueDate:''})
    const [newTeam, setNewTeam] = useState({name:''});
    const [assignUserId, setAssignUserId]= useState('');
    const [memberUserId,setMemberUserId] = useState('');
    const [commentContent,setCommentContent] = useState('');


    useEffect(()=> {
        //fetch task
        axios.get('/api/tasks')
            .then(response => setTasks(response.data))
            .catch(error => console.error('Error fetching tasks:', error))
        //fetch teams
        axios.get('/api/teams')
            .then(response => setTeams(response.data))
            .catch(error => console.error('Error fetching teams:', error));



    },[])

    const handleCreateTask = async (e) => {
        e.preventDefault()
        try{
            const response = await axios.post('/api/tasks',newTask)
            setTasks([...tasks,response.data])
            setNewTask({ title: '', description: '', status: 'TODO', dueDate: '' });
        }catch (error){
            console.error("Error creating task: ",error);
            alert(error.response?.data?.message || 'Failed to create task')

        }


    }

    const handleCreateTeam = async (e) => {
        e.preventDefault()
        if (user?.role !== 'TEAM_LEAD'){
            alert("Only team leads can create teams");
            return;
        }
        try{
            const response = await axios.post('/api/teams',newTeam);
            setTeams([...teams,response.data])
            setNewTeam({name:''});
        }catch (error){
            console.error("Error creating team: ",error);
            alert(error.response?.data?.message || 'Failed to create team')
        }

    }

    const handleAssignTask = async (taskId, userId) => {
        if (user?.role !== 'TEAM_LEAD'){
            alert("Only team leads are allowed to assign tasks");
            return;
        }

        try {
            const response = await axios.post('/api/tasks/assign/${taskId}/${userId}');
            setTasks(tasks.map(
                task => task.id === taskId ? response.data: task

            ))
        }catch (error){
            console.error("Error assigning task: ",error)
            alert(error.response?.data?.message || 'Failed to assign task');
        }

    }

    const handleAddMember = async (teamId,userId) => {
        if (user?.role !== 'TEAM_LEAD'){
            alert("Only team leads can add members to a team !")
            return
        }

        try {
            const response = await axios.post('/api/teams/${teamId}/members/${userId}')
            setTeams(teams.map(team => team.id === teamId ? response.data : team) )
        }catch (error) {
            console.error("Error adding members: ",error);
            alert(error.response?.data?.message || 'Failed to add member');
        }
    }

    const handleAddComment = async (taskId, content) => {
        try{
            const response = await axios.post('/api/tasks/${taskId}/comments',{content})
            // update task with new comment

            setTasks(tasks.map(task => task.id === taskId ? {...task,comments: [...(task.comments || []),response.data]}: task ))
            setCommentContent('');
        }catch (error){
            console.error("Error adding comment :", error);
            alert(error.response?.data?.message || 'Failed to add comment');
        }
    }

    const handleUploadAttachment = async (taskId, file) => {
        const formData = new FormData();
        formData.append('file',file)
        try{
            const response = await axios.post('/api/attachments/tasks/${taskId}/attachments',formData,{headers: {'Content-Type': 'multipart/form-data'}})
            //update task with new attachment
            setTasks(tasks.map(task => task.id === taskId ? {...task,attachments:[...(task.attachments || []),response.data]}:task))
            alert('Attachment uploaded successfully');

        }catch (error) {
            console.error("Error uploading attachment: ",error);
            alert(error.response?.data?.message || 'Failed to upload attachment');
        }

    }

    return (
        <div>
            <h2>Welcome, {user?.firstName}</h2>
            <h3>Tasks</h3>

            <form onSubmit={handleCreateTask} className="mb-4">
                <div className="form-group">
                    <input type="text" className="form-control" placeholder="Task title" value={newTask.title} onChange= {(e) => setNewTask({...newTask, title: e.target.value})} required />
                </div>
                <div className="form-group">
                    <input type="date" className="form-control" value={newTask.dueDate} onChange={(e)=> setNewTask({...newTask,dueDate: e.target.value})}/>
                </div>
                <button type="submit" className="btn btn-primary">Create Task</button>


            </form>

            <ul className="list-group mb-4">
                {tasks.map( task => (
                    <li key={task.id} className="list-group-item">
                        {task.title} - {task.status} -Due: {task.dueDate}
                        //There might be an error here

                        {

                            user?.role === 'TEAM_LEAD' && (
                                <div>
                                    <input type="number" placeholder="User ID"  onChange={(e)=> {setAssignUserId(e.target.value)}}/>
                                    <button className="btn btn-primary" onClick={() => handleAssignTask(task.id,assignUserId)}>Assign Task</button>
                                </div>
                            )}

                        <form onSubmit={(e) =>{e.preventDefault(); handleAddComment(task.id,commentContent)} }>
                            <input type="text" placeholder="Add Comment" value={commentContent} onChange={(e) => setCommentContent(e.target.value)}/>
                            <button type="submit" className="btn btn-primary">Add Comment</button>
                            <input type="file" onChange={(e)=> handleUploadAttachment(task.id, e.target.files[0])}
                            />
                        </form>
                    </li>

                ))}

            </ul>
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


        </div>
    );

}
export  default Dashboard;


