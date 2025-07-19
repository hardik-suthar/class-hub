package com.classHub.classHub.controller;

import com.classHub.classHub.entity.Comment;
import com.classHub.classHub.entity.Announcement;
import com.classHub.classHub.entity.User;
import com.classHub.classHub.service.CommentService;
import com.classHub.classHub.service.AnnouncementService;
import com.classHub.classHub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/comment")
public class CommentController {
    @Autowired
    private CommentService commentService;
    @Autowired
    private AnnouncementService announcementService;
    @Autowired
    private UserService userService;

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addComment(
            @RequestParam Long announcementId,
            @RequestParam String content) {
        User user = userService.getCurrentUser();
        Announcement announcement = announcementService.getAnnouncementById(announcementId);
        Comment comment = commentService.addComment(content, announcement, user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", comment.getId());
        response.put("content", comment.getContent());
        response.put("createdAt", comment.getCreatedAt());
        response.put("user", Map.of(
            "id", user.getId(),
            "firstName", user.getFirstName(),
            "lastName", user.getLastName(),
            "role", user.getRole().toString()
        ));
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/announcement/{announcementId}")
    public ResponseEntity<Page<Map<String, Object>>> getCommentsForAnnouncement(
            @PathVariable Long announcementId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Announcement announcement = announcementService.getAnnouncementById(announcementId);
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> comments = commentService.getCommentsForAnnouncementPaginated(announcement, pageable);
        
        Page<Map<String, Object>> responsePage = comments.map(comment -> {
            Map<String, Object> response = new HashMap<>();
            response.put("id", comment.getId());
            response.put("content", comment.getContent());
            response.put("createdAt", comment.getCreatedAt());
            
            User commentUser = comment.getUser();
            if (commentUser != null) {
                response.put("user", Map.of(
                    "id", commentUser.getId(),
                    "firstName", commentUser.getFirstName(),
                    "lastName", commentUser.getLastName(),
                    "role", commentUser.getRole().toString()
                ));
            }
            
            return response;
        });
        
        return ResponseEntity.ok(responsePage);
    }

    @GetMapping("/user")
    public ResponseEntity<List<Map<String, Object>>> getCommentsByUser() {
        User user = userService.getCurrentUser();
        List<Comment> comments = commentService.getCommentsByUser(user);
        
        List<Map<String, Object>> response = comments.stream().map(comment -> {
            Map<String, Object> commentMap = new HashMap<>();
            commentMap.put("id", comment.getId());
            commentMap.put("content", comment.getContent());
            commentMap.put("createdAt", comment.getCreatedAt());
            commentMap.put("user", Map.of(
                "id", user.getId(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "role", user.getRole().toString()
            ));
            return commentMap;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateComment(
            @PathVariable Long id,
            @RequestParam String content) {
        User user = userService.getCurrentUser();
        Comment comment = commentService.updateComment(id, content, user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", comment.getId());
        response.put("content", comment.getContent());
        response.put("createdAt", comment.getCreatedAt());
        response.put("user", Map.of(
            "id", user.getId(),
            "firstName", user.getFirstName(),
            "lastName", user.getLastName(),
            "role", user.getRole().toString()
        ));
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id) {
        User user = userService.getCurrentUser();
        commentService.deleteComment(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCommentById(
            @PathVariable Long id) {
        Comment comment = commentService.getCommentById(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", comment.getId());
        response.put("content", comment.getContent());
        response.put("createdAt", comment.getCreatedAt());
        
        User commentUser = comment.getUser();
        if (commentUser != null) {
            response.put("user", Map.of(
                "id", commentUser.getId(),
                "firstName", commentUser.getFirstName(),
                "lastName", commentUser.getLastName(),
                "role", commentUser.getRole().toString()
            ));
        }
        
        return ResponseEntity.ok(response);
    }
} 