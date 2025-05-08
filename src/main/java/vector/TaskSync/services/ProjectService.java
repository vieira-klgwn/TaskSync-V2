package vector.TaskSync.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import vector.TaskSync.models.*;
import vector.TaskSync.repositories.ProjectRepository;
import vector.TaskSync.repositories.TaskRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    public List<UserDTO> getProjectMembers(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow( () -> new IllegalArgumentException("Project not found with id"  + projectId));
        return project.getTeam().getMembers().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().toString())
                .build();
    }

    public Project getProjectById(Long projectId) {
//        Project project = projectRepository.findByIdWithTeam(projectId).orElse(null);
         Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
        if (project == null) {
            return null;
        }
        return project;
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        boolean isTeamLead = authentication.getAuthorities().stream()
//                .anyMatch(auth -> auth.getAuthority().equals("TEAM_LEAD"));
//        if (isTeamLead) {
//            return project;
//        }
//        boolean isTeamMember = project.getTeam() != null &&
//                project.getTeam().getMembers().stream()
//                        .anyMatch(member -> member.getEmail().equals(email));
//        return isTeamMember ? project : null;
    }

    public Project updateProject(Long id, Project project) {
        Optional <Project> projectOptional = projectRepository.findById(id);
        if (projectOptional.isPresent()) {
            Project project1= projectOptional.get();
            project1.setName(project.getName());
            project1.setDescription(project.getDescription());
            project1.setCreatedBy(project.getCreatedBy());
            return projectRepository.save(project);

        }
    throw new RuntimeException("Project not found");

    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);

    }
    public List<Project> getProjectsByTeam(Long teamId) {
        List<Project> projects = projectRepository.findByTeamId(teamId);
        projects.forEach(project -> {
            List<Task> tasks = taskRepository.findByProjectId(project.getId());
            long totalTasks = tasks.size();
            long doneTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
            project.setProgress(totalTasks > 0 ? (int) ((doneTasks * 100) / totalTasks) : 0);
        });
        return projects;
    }



}
