package com.classHub.classHub.repo;

import com.classHub.classHub.entity.Enrollment;
import com.classHub.classHub.entity.Group;
import com.classHub.classHub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByGroup(Group group);
    Page<Enrollment> findByGroupOrderByStudentFirstNameAsc(Group group, Pageable pageable);
    List<Enrollment> findByStudent(User student);
    
    @Query("SELECT e FROM Enrollment e WHERE e.student = :student ORDER BY e.group.createdAt DESC")
    Page<Enrollment> findByStudentOrderByGroupCreatedAtDesc(@Param("student") User student, Pageable pageable);
    
    Enrollment findByGroupAndStudent(Group group, User student);
    void deleteByGroup(Group group);
}
