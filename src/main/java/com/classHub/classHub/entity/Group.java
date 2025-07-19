package com.classHub.classHub.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "groups")
@Getter
@Setter
@NoArgsConstructor
@ToString
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    @Column(unique = true)
    private String joinCode;

    @Column(name = "created_at", nullable = true)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private User teacher;

    @OneToMany(mappedBy = "group")
    @JsonManagedReference
    private List<Enrollment> enrollments;

    @OneToMany(mappedBy = "group")
    @JsonManagedReference
    private List<Announcement> announcements;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
