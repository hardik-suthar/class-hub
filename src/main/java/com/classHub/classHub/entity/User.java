package com.classHub.classHub.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import com.classHub.classHub.entity.Role;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@ToString
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;

    private String lastName;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    private String bio;

    @OneToMany(mappedBy = "teacher")
    @JsonBackReference
    private List<Group> groupsTaught;

    @OneToMany(mappedBy = "student")
    @JsonBackReference
    private List<Enrollment> enrollments;

    @OneToMany(mappedBy = "teacher")
    @JsonBackReference
    private List<Announcement> announcements;

    @OneToMany(mappedBy = "user")
    @JsonBackReference
    private List<Comment> comments;
}
