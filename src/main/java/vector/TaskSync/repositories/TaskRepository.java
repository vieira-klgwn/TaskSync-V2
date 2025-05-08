package vector.TaskSync.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vector.TaskSync.models.Task;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {



    @Query("SELECT t FROM Task t JOIN FETCH t.project WHERE t.project.id = :projectId")
    List<Task> getTasksByProjectId(@Param("projectId") Long projectId);

    List<Task> findByProjectId(Long id);


}
