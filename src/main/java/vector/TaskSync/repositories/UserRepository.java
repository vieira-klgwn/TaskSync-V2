package vector.TaskSync.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vector.TaskSync.models.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

   Optional <User> findByEmail(String email);



}
