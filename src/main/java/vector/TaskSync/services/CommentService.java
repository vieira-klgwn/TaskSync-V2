package vector.TaskSync.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import vector.TaskSync.models.Comment;
import vector.TaskSync.models.Task;
import vector.TaskSync.repositories.CommentRepository;
import vector.TaskSync.repositories.TaskRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    private final TaskRepository taskRepository;

    //create
    public Comment saveComment(Comment comment) {
        return commentRepository.save(comment);
    }

    //findAll
    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    //findbyid
    public Optional<Comment> getCommentById(Long id) {
        return commentRepository.findById(id);
    }

    //update
    public Comment updateComment(Long id,Comment updatedComment) {
        Optional<Comment> commentOptional = commentRepository.findById(id);
        if (commentOptional.isPresent()) {
            Comment comment = commentOptional.get();
            comment.setId(updatedComment.getId());
            comment.setAuthor(updatedComment.getAuthor());
            comment.setTask(updatedComment.getTask());
            comment.setContent(updatedComment.getContent());
            comment.setCreatedAt(updatedComment.getCreatedAt());
            return commentRepository.save(comment);
        }
        throw new RuntimeException("Comment not found");

    }

    //delete
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);


    }

    public Comment createCommentForTask(Long taskId, Comment comment) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId ));
        comment.setTask(task);
        return commentRepository.save(comment);
    }



    public List<Comment> getCommentsByTask(Long taskId) {
        return commentRepository.findByTaskId(taskId);
    }

    public boolean isCommentAuthor(Long commentId, String email) {
        return getCommentById(commentId)
                .map(comment -> comment.getAuthor() != null && comment.getAuthor().getEmail().equals(email))
                .orElse(false);
    }
}
