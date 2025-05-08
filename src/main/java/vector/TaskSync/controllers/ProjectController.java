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
import vector.TaskSync.models.Project;
import vector.TaskSync.models.User;
import vector.TaskSync.models.UserDTO;
import vector.TaskSync.services.ProjectService;
import vector.TaskSync.services.UserService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private static final Logger logger = LoggerFactory.getLogger(ProjectController.class);
    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasRole('TEAM_LEAD')")
    public ResponseEntity<Project> createProject(@Valid @RequestBody Project project) {
        logger.debug("Creating project: {}", project.getName());
        Project createdProject = projectService.createProject(project);
        return new ResponseEntity<>(createdProject, HttpStatus.CREATED);
    }



    @GetMapping("/teams/{teamId}/projects")
    @PreAuthorize("hasAnyRole('USER', 'TEAM_LEAD')")
    public ResponseEntity<List<Project>> getProjectsByTeam(@PathVariable Long teamId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        logger.debug("Fetching projects for team ID {} for user: {}", teamId, email);
        List<Project> projects = projectService.getProjectsByTeam(teamId);
        // Filter projects to ensure the user is in the team (for USER role)
        if (!authentication.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_TEAM_LEAD"))) {
            projects = projects.stream()
                    .filter(project -> project.getTeam() != null &&
                            project.getTeam().getMembers().stream().anyMatch(member -> member.getEmail().equals(email)))
                    .collect(Collectors.toList());
        }
        logger.debug("Returning {} projects for team ID {} for user: {}", projects.size(), teamId, email);
        return new ResponseEntity<>(projects, HttpStatus.OK);
    }

    @GetMapping("/{projectId}")
    @PreAuthorize("hasAnyRole('USER', 'TEAM_LEAD')")
    public ResponseEntity<Project> getProjectById(@PathVariable Long projectId) {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String email = authentication.getName();
//        logger.debug("Fetching project ID {} for user: {}", projectId, email);
//        Project project = projectService.getProjectById(projectId,email);
//        if (project == null) {
//            logger.warn("Project ID {} not found or user {} not authorized", projectId, email);
//            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
//        }
//        logger.debug("Project ID {} found for user: {}", projectId, email);
        Project project = projectService.getProjectById(projectId);
        return new ResponseEntity<>(project, HttpStatus.OK);
    }

    @GetMapping("/{projectId}/members")
    @PreAuthorize("hasAnyRole('TEAM_LEAD', 'MEMBER')")
    public ResponseEntity<List<UserDTO>> getProjectMembers(@PathVariable Long projectId) {
        List<UserDTO> members = projectService.getProjectMembers(projectId);
        return ResponseEntity.ok(members);
    }
}