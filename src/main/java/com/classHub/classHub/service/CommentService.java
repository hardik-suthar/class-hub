package com.classHub.classHub.service;

import com.classHub.classHub.entity.Comment;
import com.classHub.classHub.entity.Announcement;
import com.classHub.classHub.entity.User;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {
    Comment addComment(String content, Announcement announcement, User user);
    List<Comment> getCommentsForAnnouncement(Announcement announcement);
    Page<Comment> getCommentsForAnnouncementPaginated(Announcement announcement, Pageable pageable);
    List<Comment> getCommentsByUser(User user);
    Comment updateComment(Long id, String content, User user);
    void deleteComment(Long id, User user);
    Comment getCommentById(Long id);
} 