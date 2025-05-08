package vector.TaskSync.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vector.TaskSync.models.Team;

public interface TeamRepository extends JpaRepository<Team, Long> {

}
