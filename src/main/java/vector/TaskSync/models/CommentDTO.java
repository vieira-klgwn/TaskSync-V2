package vector.TaskSync.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;
    private String content;
    private LocalDateTime createdDate;
    private UserDTO author;
    private Long taskId; // Include task ID instead of full Task object

    // Getters and setters
}