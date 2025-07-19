package com.classHub.classHub.service;

import com.classHub.classHub.entity.Group;
import com.classHub.classHub.entity.User;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GroupService {
    Group createGroup(String name, String description, User teacher);
    Group updateGroup(Long groupId, String name, String description, User teacher);
    void deleteGroup(Long groupId, User teacher);
    Group getGroupById(Long groupId);
    List<Group> getGroupsForTeacher(User teacher);
    Page<Group> getGroupsForTeacherPaginated(User teacher, Pageable pageable);
    List<Group> getGroupsForStudent(User student);
    Page<Group> getGroupsForStudentPaginated(User student, Pageable pageable);
    Group joinGroupByCode(String joinCode, User student);
    List<User> getGroupMembers(Long groupId);
    Page<User> getGroupMembersPaginated(Long groupId, Pageable pageable);
    
    // New methods for member management
    void removeStudentFromGroup(Long groupId, Long studentId, User teacher);
    void leaveGroup(Long groupId, User student);
} 