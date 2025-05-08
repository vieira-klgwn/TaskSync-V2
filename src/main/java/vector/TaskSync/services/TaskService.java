package vector.TaskSync.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vector.TaskSync.models.*;
import vector.TaskSync.repositories.ProjectRepository;
import vector.TaskSync.repositories.TaskRepository;
import vector.TaskSync.repositories.TeamRepository;
import vector.TaskSync.repositories.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;

    // Create task
    public Task createTask(Long projectId, Task task) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        // Fetch assignee from database if provided
        if (task.getAssignee() != null && task.getAssignee().getId() != null) {
            User assignee = userRepository.findById(task.getAssignee().getId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + task.getAssignee().getId()));
            task.setAssignee(assignee);
        }

        task.setProject(project);
        return taskRepository.save(task);
    }

    // Read all
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // Read (by id)
    public Optional<TaskDTO> getTaskById(Long id) {
        return taskRepository.findById(id).map(this::toDTO);
    }

    // Read tasks by project
    public List<TaskDTO> getTasksByProject(Long projectId) {
        return taskRepository.getTasksByProjectId(projectId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Update
    public Task updateTask(Long taskId, Task task) {
        Task existingTask = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        existingTask.setTitle(task.getTitle());
        existingTask.setStatus(task.getStatus());
        if (task.getAssignee() != null && task.getAssignee().getId() != null) {
            existingTask.setAssignee(userRepository.findById(task.getAssignee().getId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + task.getAssignee().getId())));
        } else {
            existingTask.setAssignee(null);
        }
        existingTask.setTeam(task.getTeam());
        return taskRepository.save(existingTask);
    }

    // Delete
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    // Assign task
    public Task assignTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Check if the user is among the task's team
        if (task.getTeam() != null && !task.getTeam().getMembers().contains(user)) {
            throw new IllegalStateException("User is not in the task's team");
        }
        task.setAssignee(user);
        return taskRepository.save(task);
    }

    // Map Task to TaskDTO
    private TaskDTO toDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setDueDate(task.getDueDate());
        dto.setTeam(task.getTeam());

        if (task.getProject() != null) {
            ProjectDTO projectDTO = new ProjectDTO();
            projectDTO.setId(task.getProject().getId());
            projectDTO.setName(task.getProject().getName());
            dto.setProject(projectDTO);
        }

        if (task.getAssignee() != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setId(task.getAssignee().getId());
            userDTO.setFirstName(task.getAssignee().getFirstName());
            userDTO.setLastName(task.getAssignee().getLastName());
            userDTO.setEmail(task.getAssignee().getEmail());
            userDTO.setRole(task.getAssignee().getRole().toString()); // Assuming User has a getRole method
            dto.setAssignee(userDTO);
        }

        return dto;
    }
}