package vector.TaskSync.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vector.TaskSync.models.Team;
import vector.TaskSync.services.TeamService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private static final Logger logger = LoggerFactory.getLogger(TeamController.class);
    @Autowired
    private TeamService teamService;

    @PostMapping
    @PreAuthorize("hasRole('TEAM_LEAD')")
    public ResponseEntity<Team> createTeam(@RequestBody Team team) {
        logger.debug("Creating team: {}", team.getName());
        Team newTeam = teamService.save(team);
        return new ResponseEntity<>(newTeam, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'TEAM_LEAD')")
    public ResponseEntity<List<Team>> getAllTeams() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        logger.debug("Fetching teams for user: {}", email);
        List<Team> teams = teamService.findAllTeams();
        // Filter teams to include only those the user is a member of (for USER role)
        if (!authentication.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_TEAM_LEAD"))) {
            teams = teams.stream()
                    .filter(team -> team.getMembers().stream().anyMatch(member -> member.getEmail().equals(email)))
                    .collect(Collectors.toList());
        }
        logger.debug("Returning {} teams for user: {}", teams.size(), email);
        return new ResponseEntity<>(teams, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'TEAM_LEAD')")
    public ResponseEntity<Team> getTeamById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        logger.debug("Fetching team ID {} for user: {}", id, email);
        return teamService.findTeamById(id)
                .filter(team -> authentication.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_TEAM_LEAD")) ||
                        team.getMembers().stream().anyMatch(member -> member.getEmail().equals(email)))
                .map(team -> {
                    logger.debug("Team ID {} found for user: {}", id, email);
                    return new ResponseEntity<>(team, HttpStatus.OK);
                })
                .orElseGet(() -> {
                    logger.warn("Team ID {} not found or user {} not a member", id, email);
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                });
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEAM_LEAD')")
    public ResponseEntity<Team> updateTeam(@PathVariable Long id, @RequestBody Team team) {
        logger.debug("Updating team ID: {}", id);
        try {
            Team updatedTeam = teamService.updateTeam(id, team);
            return new ResponseEntity<>(updatedTeam, HttpStatus.OK);
        } catch (RuntimeException e) {
            logger.error("Failed to update team ID {}: {}", id, e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEAM_LEAD')")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        logger.debug("Deleting team ID: {}", id);
        try {
            teamService.deleteTeam(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            logger.error("Failed to delete team ID {}: {}", id, e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{teamId}/members/{userId}")
    @PreAuthorize("hasRole('TEAM_LEAD')")
    public ResponseEntity<Team> addMember(@PathVariable Long teamId, @PathVariable Long userId) {
        logger.debug("Adding user ID {} to team ID {}", userId, teamId);
        try {
            Team updatedTeam = teamService.addMember(teamId, userId);
            return new ResponseEntity<>(updatedTeam, HttpStatus.OK);
        } catch (RuntimeException e) {
            logger.error("Failed to add user ID {} to team ID {}: {}", userId, teamId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    @PreAuthorize("hasRole('TEAM_LEAD')")
    public ResponseEntity<Team> removeMember(@PathVariable Long teamId, @PathVariable Long userId) {
        logger.debug("Removing user ID {} from team ID {}", userId, teamId);
        try {
            Team updatedTeam = teamService.removeMember(teamId, userId);
            return new ResponseEntity<>(updatedTeam, HttpStatus.OK);
        } catch (RuntimeException e) {
            logger.error("Failed to remove user ID {} from team ID {}: {}", userId, teamId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}