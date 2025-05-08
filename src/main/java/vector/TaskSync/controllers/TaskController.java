package vector.TaskSync.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vector.TaskSync.models.Task;
import vector.TaskSync.models.TaskDTO;
import vector.TaskSync.services.TaskService;
import vector.TaskSync.services.TeamAccessService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);
    private final TaskService taskService;
    private final TeamAccessService teamAccessService;

    @PostMapping("/projects/{projectId}/tasks")
    @PreAuthorize("hasRole('TEAM_LEAD')")
    public ResponseEntity<Task> createTask(@PathVariable Long projectId, @Valid @RequestBody Task task) {
        logger.debug("Creating task for project ID: {}", projectId);
        Task createdTask = taskService.createTask(projectId, task);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    @GetMapping("/projects/{projectId}/tasks")
    @PreAuthorize("hasAnyRole('USER', 'TEAM_LEAD')")
    public ResponseEntity<List<TaskDTO>> getTasksByProject(@PathVariable Long projectId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        logger.debug("Fetching tasks for project ID {} for user: {}", projectId, email);
        List<TaskDTO> tasks = taskService.getTasksByProject(projectId);
        // Filter tasks to ensure the user is in the project’s team (for USER role)
        if (!authentication.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_TEAM_LEAD"))) {
            tasks = tasks.stream()
                    .filter(task -> task.getProject() != null && task.getProject().getTeam() != null &&
                            task.getProject().getTeam().getMembers().stream().anyMatch(member -> member.getEmail().equals(email)))
                    .collect(Collectors.toList());
        }
        logger.debug("Returning {} tasks for project ID {} for user: {}", tasks.size(), projectId, email);
        return new ResponseEntity<>(tasks, HttpStatus.OK);
    }

    @GetMapping("/tasks/{id}")
    @PreAuthorize("hasAnyRole('USER', 'TEAM_LEAD')")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        logger.debug("Fetching task ID {} for user: {}", id, email);
        return taskService.getTaskById(id)
//                .filter(task -> task.getProject() != null && task.getProject().getTeam() != null &&
//                        task.getProject().getTeam().getMembers().stream().anyMatch(member -> member.getEmail().equals(email)))
                .map(task -> {
                    logger.debug("Task ID {} found for user: {}", id, email);
                    return new ResponseEntity<>(task, HttpStatus.OK);
                })
                .orElseGet(() -> {
//                    logger.warn("The team  members are: {}" , taskService.getTaskById(id).map(task -> task.getProject().getTeam().getMembers().stream() ));
//                    logger.warn("The task is: {}", taskService.getTaskById(id)
//                            .filter(task -> task.getProject() != null && task.getProject().getTeam() != null &&
//                                    task.getProject().getTeam().getMembers().stream().anyMatch(member -> member.getEmail().equals(email))));
//                    logger.warn("Again the task is: {}", taskService.getTaskById(id));
                    logger.warn("Task ID {} not found or user {} not in team", id, email);
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                });
    }

    @PutMapping("/tasks/{id}")
    @PreAuthorize("hasRole('TEAM_LEAD')")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @Valid @RequestBody Task task) {
        logger.debug("Updating task ID: {}", id);
        try {
            Task updatedTask = taskService.updateTask(id, task);
            return new ResponseEntity<>(updatedTask, HttpStatus.OK);
        } catch (RuntimeException e) {
            logger.error("Failed to update task ID {}: {}", id, e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/tasks/{id}")
    @PreAuthorize("hasRole('TEAM_LEAD')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        logger.debug("Deleting task ID: {}", id);
        try {
            taskService.deleteTask(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            logger.error("Failed to delete task ID {}: {}", id, e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/tasks/assign/{taskId}/{userId}")
    @PreAuthorize("hasRole('TEAM_LEAD')")
    public ResponseEntity<Task> assignTask(@PathVariable Long taskId, @PathVariable Long userId) {
        logger.debug("Assigning task ID {} to user ID {}", taskId, userId);
        try {
            Task assignedTask = taskService.assignTask(taskId, userId);
            return new ResponseEntity<>(assignedTask, HttpStatus.OK);
        } catch (RuntimeException e) {
            logger.error("Failed to assign task ID {} to user ID {}: {}", taskId, userId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}