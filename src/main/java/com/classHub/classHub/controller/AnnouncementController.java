package com.classHub.classHub.controller;

import com.classHub.classHub.entity.Announcement;
import com.classHub.classHub.entity.Group;
import com.classHub.classHub.entity.User;
import com.classHub.classHub.service.AnnouncementService;
import com.classHub.classHub.service.GroupService;
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
@RequestMapping("/announcement")
public class AnnouncementController {
    @Autowired
    private AnnouncementService announcementService;
    @Autowired
    private GroupService groupService;
    @Autowired
    private UserService userService;

    @PostMapping("/teacher/create")
    public ResponseEntity<Map<String, Object>> createAnnouncement(
            @RequestParam Long groupId,
            @RequestParam String content) {
        User teacher = userService.getCurrentUser();
        Group group = groupService.getGroupById(groupId);
        Announcement announcement = announcementService.createAnnouncement(content, group, teacher);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", announcement.getId());
        response.put("content", announcement.getContent());
        response.put("createdAt", announcement.getCreatedAt());
        response.put("user", Map.of(
            "id", teacher.getId(),
            "firstName", teacher.getFirstName(),
            "lastName", teacher.getLastName(),
            "role", teacher.getRole().toString()
        ));
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/teacher/{id}")
    public ResponseEntity<Map<String, Object>> updateAnnouncement(
            @PathVariable Long id,
            @RequestParam String content) {
        User teacher = userService.getCurrentUser();
        Announcement announcement = announcementService.updateAnnouncement(id, content, teacher);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", announcement.getId());
        response.put("content", announcement.getContent());
        response.put("createdAt", announcement.getCreatedAt());
        response.put("user", Map.of(
            "id", teacher.getId(),
            "firstName", teacher.getFirstName(),
            "lastName", teacher.getLastName(),
            "role", teacher.getRole().toString()
        ));
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/teacher/{id}")
    public ResponseEntity<Void> deleteAnnouncement(
            @PathVariable Long id) {
        User teacher = userService.getCurrentUser();
        announcementService.deleteAnnouncement(id, teacher);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<Page<Map<String, Object>>> getAnnouncementsForGroup(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Group group = groupService.getGroupById(groupId);
        Pageable pageable = PageRequest.of(page, size);
        Page<Announcement> announcements = announcementService.getAnnouncementsForGroupPaginated(group, pageable);
        
        Page<Map<String, Object>> responsePage = announcements.map(announcement -> {
            Map<String, Object> response = new HashMap<>();
            response.put("id", announcement.getId());
            response.put("content", announcement.getContent());
            response.put("createdAt", announcement.getCreatedAt());
            
            User teacher = announcement.getTeacher();
            if (teacher != null) {
                response.put("user", Map.of(
                    "id", teacher.getId(),
                    "firstName", teacher.getFirstName(),
                    "lastName", teacher.getLastName(),
                    "role", teacher.getRole().toString()
                ));
            }
            
            return response;
        });
        
        return ResponseEntity.ok(responsePage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getAnnouncementById(
            @PathVariable Long id) {
        Announcement announcement = announcementService.getAnnouncementById(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", announcement.getId());
        response.put("content", announcement.getContent());
        response.put("createdAt", announcement.getCreatedAt());
        
        User teacher = announcement.getTeacher();
        if (teacher != null) {
            response.put("user", Map.of(
                "id", teacher.getId(),
                "firstName", teacher.getFirstName(),
                "lastName", teacher.getLastName(),
                "role", teacher.getRole().toString()
            ));
        }
        
        return ResponseEntity.ok(response);
    }
} 