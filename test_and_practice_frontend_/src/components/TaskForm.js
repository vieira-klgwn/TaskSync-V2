import React from 'react'

const TaskForm = () => {

    const [newTask, setNewTask] = useState({title: '',description:'',status:'TODO',dueDate:''})
    const [tasks, setTasks] = useState([]);

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

    useEffect(()=> {
        //fetch task
        axios.get('/api/tasks')
            .then(response => setTasks(response.data))
            .catch(error => console.error('Error fetching tasks:', error))
      



    },[])

    
  return (
    <form onSubmit={handleCreateTask} className="mb-4">
                <div className="form-group">
                    <input type="text" className="form-control" placeholder="Task title" value={newTask.title} onChange= {(e) => setNewTask({...newTask, title: e.target.value})} required />
                </div>
                <div className="form-group">
                    <input type="date" className="form-control" value={newTask.dueDate} onChange={(e)=> setNewTask({...newTask,dueDate: e.target.value})}/>
                </div>
                <button type="submit" className="btn btn-primary">Create Task</button>


            </form>
  )
}

export default TaskForm;
