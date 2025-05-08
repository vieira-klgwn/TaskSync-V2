package vector.TaskSync.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vector.TaskSync.models.Attachment;
import vector.TaskSync.services.AttachmentService;
import vector.TaskSync.services.FileStorageService;
import vector.TaskSync.services.TeamAccessService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    private final TeamAccessService teamAccessService;

    private final FileStorageService fileStorageService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'TEAM_LEAD')")
    public ResponseEntity<Attachment> createAttachment(@RequestBody Attachment attachment) {
        Attachment createdAttachment = attachmentService.createAttachment(attachment);
        return new ResponseEntity<>(createdAttachment, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'TEAM_LEAD')")
    public ResponseEntity<List<Attachment>> getAllAttachments() {
        return ResponseEntity.ok(attachmentService.getAllAttachments().stream()
                .filter(attachment -> attachment.getTask().getTeam() == null || teamAccessService.isUserInTeam(attachment.getTask().getTeam().getId()))
                .collect(Collectors.toList()));

    }
    @GetMapping("/{id}")
    @PreAuthorize("hasRole(@teamAccessService.isUserInTeam(#id))")
    public ResponseEntity<Attachment> getAttachmentById(@PathVariable("id") Long id) {
        return attachmentService.getAttachmentById(id)
                .map(attachment -> new ResponseEntity<>(attachment, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Attachment> updateAttachment(@PathVariable Long id,@Valid @RequestBody Attachment attachment) {
        try{
            Attachment updatedAttachment = attachmentService.updateAttachment(id, attachment);
            return new ResponseEntity<>(updatedAttachment, HttpStatus.OK);
        }catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Attachment> deleteAttachment(@PathVariable Long id) {
        try {
            attachmentService.deleteAttachmentById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);

        }catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    @PostMapping("/tasks/{taskId}/attachments")
    @PreAuthorize("hasAnyRole('USER', 'TEAM_LEAD')")
    public ResponseEntity<Attachment> createAttachmentForTask(@PathVariable Long taskId, @RequestParam("file") MultipartFile file) {
        Attachment attachment = new Attachment();
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFileUrl(fileStorageService.uploadFile(file));
        Attachment createdAttachment = attachmentService.createAttachmentForTask(taskId, attachment);
        return new ResponseEntity<>(createdAttachment, HttpStatus.CREATED);
    }

}
