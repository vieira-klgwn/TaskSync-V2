package vector.TaskSync.controllers;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vector.TaskSync.models.Comment;
import vector.TaskSync.models.CommentDTO;
import vector.TaskSync.models.UserDTO;
import vector.TaskSync.services.CommentService;
import vector.TaskSync.services.TeamAccessService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private static final Logger logger = LoggerFactory.getLogger(CommentController.class);
    private final CommentService commentService;
    private final TeamAccessService teamAccessService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'TEAM_LEAD')")
    public ResponseEntity<Comment> createComment(@RequestBody Comment comment) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        logger.debug("Creating comment for user: {}", email);
        Comment createdComment = commentService.saveComment(comment);
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'TEAM_LEAD')")
    public ResponseEntity<List<Comment>> getAllComments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        logger.debug("Fetching all comments for user: {}", email);
        List<Comment> comments = commentService.getAllComments().stream()
                .filter(comment -> comment.getTask() != null && comment.getTask().getProject() != null &&
                        comment.getTask().getProject().getTeam() != null &&
                        (authentication.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_TEAM_LEAD")) ||
                                comment.getTask().getProject().getTeam().getMembers().stream().anyMatch(member -> member.getEmail().equals(email))))
                .collect(Collectors.toList());
        logger.debug("Returning {} comments for user: {}", comments.size(), email);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'TEAM_LEAD')")
    public ResponseEntity<Comment> getCommentById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        logger.debug("Fetching comment ID {} for user: {}", id, email);
        return commentService.getCommentById(id)
                .filter(comment -> comment.getTask() != null && comment.getTask().getProject() != null &&
                        comment.getTask().getProject().getTeam() != null &&
                        (authentication.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_TEAM_LEAD")) ||
                                comment.getTask().getProject().getTeam().getMembers().stream().anyMatch(member -> member.getEmail().equals(email))))
                .map(comment -> {
                    logger.debug("Comment ID {} found for user: {}", id, email);
                    return new ResponseEntity<>(comment, HttpStatus.OK);
                })
                .orElseGet(() -> {
                    logger.warn("Comment ID {} not found or user {} not in team", id, email);
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                });
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEAM_LEAD') || @commentService.isCommentAuthor(#id, authentication.name)")
    public ResponseEntity<Comment> updateComment(@PathVariable Long id, @RequestBody Comment comment) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        logger.debug("Updating comment ID {} for user: {}", id, email);
        try {
            Comment updatedComment = commentService.updateComment(id, comment);
            return new ResponseEntity<>(updatedComment, HttpStatus.OK);
        } catch (RuntimeException e) {
            logger.error("Failed to update comment ID {}: {}", id, e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEAM_LEAD') || @commentService.isCommentAuthor(#id, authentication.name)")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        logger.debug("Deleting comment ID {} for user: {}", id, email);
        try {
            commentService.deleteComment(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            logger.error("Failed to delete comment ID {}: {}", id, e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/tasks/{taskId}/comment")
    @PreAuthorize("hasAnyRole('USER', 'TEAM_LEAD')")
    public ResponseEntity<CommentDTO> createCommentForTask(
            @PathVariable("taskId") @Positive Long taskId,
            @Valid @RequestBody CommentDTO commentDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        logger.debug("Creating comment for task ID {} for user: {}", taskId, email);
        Comment comment = mapToComment(commentDTO);
        Comment createdComment = commentService.createCommentForTask(taskId, comment);
        return new ResponseEntity<>(mapToCommentDTO(createdComment), HttpStatus.CREATED);
    }

    @GetMapping("/tasks/{taskId}/comments")
    @PreAuthorize("hasAnyRole('USER', 'TEAM_LEAD')")
    public ResponseEntity<List<Comment>> getCommentsByTask(@PathVariable Long taskId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        logger.debug("Fetching comments for task ID {} for user: {}", taskId, email);
        List<Comment> comments = commentService.getCommentsByTask(taskId).stream()
                .filter(comment -> comment.getTask() != null && comment.getTask().getProject() != null &&
                        comment.getTask().getProject().getTeam() != null &&
                        (authentication.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_TEAM_LEAD")) ||
                                comment.getTask().getProject().getTeam().getMembers().stream().anyMatch(member -> member.getEmail().equals(email))))
                .collect(Collectors.toList());
        logger.debug("Returning {} comments for task ID {} for user: {}", comments.size(), taskId, email);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    private Comment mapToComment(CommentDTO commentDTO) {
        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());
        return comment;
    }

    private CommentDTO mapToCommentDTO(Comment comment) {
        CommentDTO commentDTO = new CommentDTO();
        commentDTO.setId(comment.getId());
        commentDTO.setContent(comment.getContent());
        commentDTO.setCreatedDate(comment.getCreatedDate());

        if (comment.getAuthor() != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setId(comment.getAuthor().getId());
            userDTO.setFirstName(comment.getAuthor().getFirstName());
            userDTO.setLastName(comment.getAuthor().getLastName());
            commentDTO.setAuthor(userDTO);
        }

        if (comment.getTask() != null) {
            commentDTO.setTaskId(comment.getTask().getId());
        }

        return commentDTO;
    }
}