package com.classHub.classHub.service;

import com.classHub.classHub.entity.Comment;
import com.classHub.classHub.entity.Announcement;
import com.classHub.classHub.entity.User;
import com.classHub.classHub.repo.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Override
    @Transactional
    public Comment addComment(String content, Announcement announcement, User user) {
        Comment comment = new Comment();
        comment.setContent(content);
        comment.setAnnouncement(announcement);
        comment.setUser(user);
        return commentRepository.save(comment);
    }

    @Override
    public List<Comment> getCommentsForAnnouncement(Announcement announcement) {
        return commentRepository.findByAnnouncement(announcement);
    }

    @Override
    public Page<Comment> getCommentsForAnnouncementPaginated(Announcement announcement, Pageable pageable) {
        return commentRepository.findByAnnouncementOrderByCreatedAtDesc(announcement, pageable);
    }

    @Override
    public List<Comment> getCommentsByUser(User user) {
        return commentRepository.findByUser(user);
    }

    @Override
    @Transactional
    public Comment updateComment(Long id, String content, User user) {
        Comment comment = commentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not your comment");
        }
        
        comment.setContent(content);
        return commentRepository.save(comment);
    }

    @Override
    @Transactional
    public void deleteComment(Long id, User user) {
        Comment comment = commentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Allow deletion if user is the comment author OR if user is the teacher of the announcement's group
        if (!comment.getUser().getId().equals(user.getId()) && 
            !comment.getAnnouncement().getTeacher().getId().equals(user.getId())) {
            throw new RuntimeException("Not your comment and you are not the teacher of this announcement's group");
        }
        
        commentRepository.delete(comment);
    }

    @Override
    public Comment getCommentById(Long id) {
        return commentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
    }
} 