import React from 'react'

const TaskList = () => {
    const {user} = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [assignUserId, setAssignUserId]= useState('');


    useEffect(()=> {
        //fetch task
        axios.get('/api/tasks')
            .then(response => setTasks(response.data))
            .catch(error => console.error('Error fetching tasks:', error))
        



    },[])

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
  return (
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
  )
}

export default TaskList
