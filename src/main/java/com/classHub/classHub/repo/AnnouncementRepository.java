package com.classHub.classHub.repo;

import com.classHub.classHub.entity.Announcement;
import com.classHub.classHub.entity.Group;
import com.classHub.classHub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByGroup(Group group);
    Page<Announcement> findByGroupOrderByCreatedAtDesc(Group group, Pageable pageable);
    List<Announcement> findByTeacher(User teacher);
    void deleteByGroup(Group group);
}
