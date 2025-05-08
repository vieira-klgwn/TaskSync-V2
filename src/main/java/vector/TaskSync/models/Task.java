package vector.TaskSync.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.ToString;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "blank should no be empty")
    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.TODO; //e.g To do, in progress and done

    private LocalDateTime dueDate;


    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference
    @ToString.Exclude
    private Project project;

    @ManyToOne
    @JoinColumn(name= "assignee_id")
    @JsonIgnore
    private User assignee;

    @ManyToOne
    @JoinColumn(name="team_id")
    @JsonIgnore
    private Team team;

    @OneToMany(mappedBy = "task")
    @JsonIgnore
    @ToString.Exclude
    private List<Comment> comments;

    @OneToMany(mappedBy = "task")
    @JsonIgnore
    @ToString.Exclude
    private List<Attachment> attachments;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdDate;

    @LastModifiedBy
    private String lastModifiedBy;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;


}
