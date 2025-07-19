package com.classHub.classHub.repo;

import com.classHub.classHub.entity.Group;
import com.classHub.classHub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByTeacher(User teacher);
    Page<Group> findByTeacherOrderByCreatedAtDesc(User teacher, Pageable pageable);
    Group findByJoinCode(String joinCode);
    
    @Query("SELECT g FROM Group g WHERE UPPER(g.joinCode) = UPPER(:joinCode)")
    Group findByJoinCodeIgnoreCase(@Param("joinCode") String joinCode);
}
