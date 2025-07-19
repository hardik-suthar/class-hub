package com.classHub.classHub.controller;

import com.classHub.classHub.entity.Group;
import com.classHub.classHub.entity.User;
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
@RequestMapping("/group")
public class GroupController {
    @Autowired
    private GroupService groupService;
    @Autowired
    private UserService userService;

    @PostMapping("/teacher/create")
    public ResponseEntity<Map<String, Object>> createGroup(
            @RequestParam String name,
            @RequestParam String description) {
        User teacher = userService.getCurrentUser();
        Group group = groupService.createGroup(name, description, teacher);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", group.getId());
        response.put("name", group.getName());
        response.put("description", group.getDescription());
        response.put("joinCode", group.getJoinCode());
        response.put("createdAt", group.getCreatedAt());
        response.put("teacher", Map.of(
            "id", teacher.getId(),
            "firstName", teacher.getFirstName(),
            "lastName", teacher.getLastName(),
            "role", teacher.getRole().toString()
        ));
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/teacher/{groupId}")
    public ResponseEntity<Map<String, Object>> updateGroup(
            @PathVariable Long groupId,
            @RequestParam String name,
            @RequestParam String description) {
        User teacher = userService.getCurrentUser();
        Group group = groupService.updateGroup(groupId, name, description, teacher);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", group.getId());
        response.put("name", group.getName());
        response.put("description", group.getDescription());
        response.put("joinCode", group.getJoinCode());
        response.put("createdAt", group.getCreatedAt());
        response.put("teacher", Map.of(
            "id", teacher.getId(),
            "firstName", teacher.getFirstName(),
            "lastName", teacher.getLastName(),
            "role", teacher.getRole().toString()
        ));
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/teacher/{groupId}")
    public ResponseEntity<Void> deleteGroup(
            @PathVariable Long groupId) {
        User teacher = userService.getCurrentUser();
        groupService.deleteGroup(groupId, teacher);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/teacher/list")
    public ResponseEntity<Page<Map<String, Object>>> getGroupsForTeacher(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User teacher = userService.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<Group> groups = groupService.getGroupsForTeacherPaginated(teacher, pageable);
        
        Page<Map<String, Object>> responsePage = groups.map(group -> {
            Map<String, Object> response = new HashMap<>();
            response.put("id", group.getId());
            response.put("name", group.getName());
            response.put("description", group.getDescription());
            response.put("joinCode", group.getJoinCode());
            response.put("createdAt", group.getCreatedAt());
            response.put("teacher", Map.of(
                "id", teacher.getId(),
                "firstName", teacher.getFirstName(),
                "lastName", teacher.getLastName(),
                "role", teacher.getRole().toString()
            ));
            return response;
        });
        
        return ResponseEntity.ok(responsePage);
    }

    @GetMapping("/student/list")
    public ResponseEntity<Page<Map<String, Object>>> getGroupsForStudent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User student = userService.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<Group> groups = groupService.getGroupsForStudentPaginated(student, pageable);
        
        Page<Map<String, Object>> responsePage = groups.map(group -> {
            Map<String, Object> response = new HashMap<>();
            response.put("id", group.getId());
            response.put("name", group.getName());
            response.put("description", group.getDescription());
            response.put("joinCode", group.getJoinCode());
            response.put("createdAt", group.getCreatedAt());
            
            User groupTeacher = group.getTeacher();
            if (groupTeacher != null) {
                response.put("teacher", Map.of(
                    "id", groupTeacher.getId(),
                    "firstName", groupTeacher.getFirstName(),
                    "lastName", groupTeacher.getLastName(),
                    "role", groupTeacher.getRole().toString()
                ));
            }
            
            return response;
        });
        
        return ResponseEntity.ok(responsePage);
    }

    @PostMapping("/student/join")
    public ResponseEntity<Map<String, Object>> joinGroupByCode(
            @RequestParam String joinCode) {
        User student = userService.getCurrentUser();
        Group group = groupService.joinGroupByCode(joinCode, student);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", group.getId());
        response.put("name", group.getName());
        response.put("description", group.getDescription());
        response.put("joinCode", group.getJoinCode());
        response.put("createdAt", group.getCreatedAt());
        
        User groupTeacher = group.getTeacher();
        if (groupTeacher != null) {
            response.put("teacher", Map.of(
                "id", groupTeacher.getId(),
                "firstName", groupTeacher.getFirstName(),
                "lastName", groupTeacher.getLastName(),
                "role", groupTeacher.getRole().toString()
            ));
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<Page<User>> getGroupMembers(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> members = groupService.getGroupMembersPaginated(groupId, pageable);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<Map<String, Object>> getGroupById(
            @PathVariable Long groupId) {
        Group group = groupService.getGroupById(groupId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", group.getId());
        response.put("name", group.getName());
        response.put("description", group.getDescription());
        response.put("joinCode", group.getJoinCode());
        response.put("createdAt", group.getCreatedAt());
        
        User groupTeacher = group.getTeacher();
        if (groupTeacher != null) {
            response.put("teacher", Map.of(
                "id", groupTeacher.getId(),
                "firstName", groupTeacher.getFirstName(),
                "lastName", groupTeacher.getLastName(),
                "role", groupTeacher.getRole().toString()
            ));
        }
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/teacher/{groupId}/students/{studentId}")
    public ResponseEntity<Void> removeStudentFromGroup(
            @PathVariable Long groupId,
            @PathVariable Long studentId) {
        User teacher = userService.getCurrentUser();
        groupService.removeStudentFromGroup(groupId, studentId, teacher);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/student/{groupId}/leave")
    public ResponseEntity<Void> leaveGroup(
            @PathVariable Long groupId) {
        User student = userService.getCurrentUser();
        groupService.leaveGroup(groupId, student);
        return ResponseEntity.noContent().build();
    }
} 