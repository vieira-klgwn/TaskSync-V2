package vector.TaskSync.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vector.TaskSync.models.Team;
import vector.TaskSync.models.User;
import vector.TaskSync.repositories.TeamRepository;
import vector.TaskSync.repositories.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;



    //create
    public Team save(Team team) {
        return teamRepository.save(team);
    }

    //find all
    public List<Team> findAllTeams() {
        return teamRepository.findAll();
    }

    //find by id
    public Optional<Team> findTeamById(Long teamId) {
        return teamRepository.findById(teamId);
    }

    //update
    public Team updateTeam(Long id,Team team) {
        Optional<Team> optionalTeam = teamRepository.findById(id);
        if (optionalTeam.isPresent()) {
            Team updatedTeam = optionalTeam.get();
            updatedTeam.setName(team.getName());
            updatedTeam.setId(team.getId());
            updatedTeam.setMembers(team.getMembers());
            updatedTeam.setTasks(team.getTasks());

            return teamRepository.save(updatedTeam);

        }
        throw new RuntimeException("Team not found");
    }

    //delete
    public void deleteTeam(Long id) {
        teamRepository.deleteById(id);
    }

    public Team addMember (Long teamId, Long userId) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found with id: " +teamId));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        if (team.getMembers().contains(user)) {
            throw new IllegalStateException("Team is already member of this team");
        }

        team.getMembers().add(user);
        user.getTeams().add(team);
        teamRepository.save(team);
        userRepository.save(user);
        return team;
    }

    public Team removeMember (Long teamId, Long userId) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found with id: " +teamId));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        if (!team.getMembers().contains(user)) {
            throw new IllegalStateException("User is not a member of the team");
        }

        team.getMembers().remove(user);
        user.getTeams().remove(team);
        teamRepository.save(team);
        userRepository.save(user);
        return team;
    }
}
