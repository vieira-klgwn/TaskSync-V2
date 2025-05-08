package vector.TaskSync.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vector.TaskSync.models.Attachment;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
}
