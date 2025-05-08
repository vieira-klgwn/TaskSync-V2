package vector.TaskSync.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vector.TaskSync.models.Project;
import vector.TaskSync.models.Team;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByTeamId(Long teamId);
//    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.team WHERE p.id = :projectId")
//    Optional<Project> findByIdWithTeam(@Param("projectId") Long projectId);



}
