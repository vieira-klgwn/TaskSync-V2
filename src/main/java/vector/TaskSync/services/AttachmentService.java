package vector.TaskSync.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vector.TaskSync.models.Attachment;
import vector.TaskSync.models.Task;
import vector.TaskSync.repositories.AttachmentRepository;
import vector.TaskSync.repositories.TaskRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;

    private final TaskRepository taskRepository;

    private  final FileStorageService fileStorageService;

    //create
    public Attachment createAttachment(Attachment attachment) {
        return attachmentRepository.save(attachment);
    }

    //findAll
    public List<Attachment> getAllAttachments() {
        return attachmentRepository.findAll();
    }

    //findbyid
    public Optional<Attachment> getAttachmentById(long id) {
        return attachmentRepository.findById(id);
    }

    //update
    public Attachment updateAttachment(Long id,Attachment updatedAttachment) {
        Optional<Attachment> attachmentOptional = attachmentRepository.findById(id);
        if (attachmentOptional.isPresent()) {
            Attachment attachment = attachmentOptional.get();
            attachment.setId(updatedAttachment.getId());
            attachment.setFileName(updatedAttachment.getFileName());
            attachment.setFileUrl(updatedAttachment.getFileUrl());
            attachment.setTask(updatedAttachment.getTask());
            return attachmentRepository.save(attachment);
        }
        throw new RuntimeException("Attachment not found");
    }

    //delete
    public void deleteAttachmentById(long id) {
        attachmentRepository.deleteById(id);
    }

    public Attachment createAttachmentForTask(long taskId, Attachment attachment) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id " + taskId));
        attachment.setTask(task);
        return attachmentRepository.save(attachment);
    }


    public String uploadfile(org.springframework.web.multipart.MultipartFile file) {
        return fileStorageService.uploadFile(file);
    }
}
