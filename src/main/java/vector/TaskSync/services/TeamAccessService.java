package vector.TaskSync.services;


import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import vector.TaskSync.repositories.TeamRepository;
import vector.TaskSync.repositories.TaskRepository;
import vector.TaskSync.models.Task;

@Service
@RequiredArgsConstructor
public class TeamAccessService {

    private final TeamRepository teamRepository;
    private final TaskRepository taskRepository;

    public boolean isUserInTeam(Long teamId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return teamRepository.findById(teamId)
                .map(team -> team.getMembers().stream()
                        .anyMatch(user -> user.getEmail().equals(email)))
                .orElse(false);
    }

    public boolean isUserInProject(Long taskId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return taskRepository.findById(taskId)
                .map(task -> task.getProject().getTeam().getMembers().stream()
                        .anyMatch(user -> user.getEmail().equals(email)))
                .orElse(false);
    }

}

