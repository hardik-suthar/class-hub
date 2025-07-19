package com.classHub.classHub.repo;

import com.classHub.classHub.entity.Comment;
import com.classHub.classHub.entity.Announcement;
import com.classHub.classHub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByAnnouncement(Announcement announcement);
    Page<Comment> findByAnnouncementOrderByCreatedAtDesc(Announcement announcement, Pageable pageable);
    List<Comment> findByUser(User user);
    void deleteByAnnouncement(Announcement announcement);
}
