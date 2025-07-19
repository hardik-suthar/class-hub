package com.classHub.classHub.service;

import com.classHub.classHub.entity.Group;
import com.classHub.classHub.entity.User;
import com.classHub.classHub.entity.Enrollment;
import com.classHub.classHub.entity.Announcement;
import com.classHub.classHub.repo.GroupRepository;
import com.classHub.classHub.repo.EnrollmentRepository;
import com.classHub.classHub.repo.AnnouncementRepository;
import com.classHub.classHub.repo.CommentRepository;
import com.classHub.classHub.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GroupServiceImpl implements GroupService {
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    @Autowired
    private AnnouncementRepository announcementRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserService userService;

    @Override
    @Transactional
    public Group createGroup(String name, String description, User teacher) {
        Group group = new Group();
        group.setName(name);
        group.setDescription(description);
        group.setTeacher(teacher);
        group.setJoinCode(UUID.randomUUID().toString().substring(0, 8));
        return groupRepository.save(group);
    }

    @Override
    @Transactional
    public Group updateGroup(Long groupId, String name, String description, User teacher) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        if (!group.getTeacher().getId().equals(teacher.getId())) throw new RuntimeException("Not your group");
        group.setName(name);
        group.setDescription(description);
        return groupRepository.save(group);
    }

    @Override
    @Transactional
    public void deleteGroup(Long groupId, User teacher) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        if (!group.getTeacher().getId().equals(teacher.getId())) throw new RuntimeException("Not your group");
        
        // Delete all comments for announcements in this group first
        List<Announcement> announcements = announcementRepository.findByGroup(group);
        for (Announcement announcement : announcements) {
            commentRepository.deleteByAnnouncement(announcement);
        }
        
        // Delete all announcements for this group
        announcementRepository.deleteByGroup(group);
        
        // Delete all enrollments for this group
        enrollmentRepository.deleteByGroup(group);
        
        // Now delete the group
        groupRepository.delete(group);
    }

    @Override
    public Group getGroupById(Long groupId) {
        return groupRepository.findById(groupId).orElseThrow();
    }

    @Override
    public List<Group> getGroupsForTeacher(User teacher) {
        return groupRepository.findByTeacher(teacher);
    }

    @Override
    public Page<Group> getGroupsForTeacherPaginated(User teacher, Pageable pageable) {
        return groupRepository.findByTeacherOrderByCreatedAtDesc(teacher, pageable);
    }

    @Override
    public List<Group> getGroupsForStudent(User student) {
        return enrollmentRepository.findByStudent(student).stream().map(Enrollment::getGroup).collect(Collectors.toList());
    }

    @Override
    public Page<Group> getGroupsForStudentPaginated(User student, Pageable pageable) {
        return enrollmentRepository.findByStudentOrderByGroupCreatedAtDesc(student, pageable)
            .map(Enrollment::getGroup);
    }

    @Override
    @Transactional
    public Group joinGroupByCode(String joinCode, User student) {
        Group group = groupRepository.findByJoinCodeIgnoreCase(joinCode);
        if (group == null) throw new RuntimeException("Group not found");
        if (enrollmentRepository.findByGroupAndStudent(group, student) != null) return group;
        Enrollment enrollment = new Enrollment();
        enrollment.setGroup(group);
        enrollment.setStudent(student);
        enrollmentRepository.save(enrollment);
        return group;
    }

    @Override
    public List<User> getGroupMembers(Long groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        return enrollmentRepository.findByGroup(group).stream().map(Enrollment::getStudent).collect(Collectors.toList());
    }

    @Override
    public Page<User> getGroupMembersPaginated(Long groupId, Pageable pageable) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        return enrollmentRepository.findByGroupOrderByStudentFirstNameAsc(group, pageable)
            .map(Enrollment::getStudent);
    }

    @Override
    @Transactional
    public void removeStudentFromGroup(Long groupId, Long studentId, User teacher) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        
        // Verify that the user is the teacher of this group
        if (!group.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Not your group");
        }
        
        // Find the student to remove
        User studentToRemove = userRepository.findById(studentId).orElseThrow();
        
        // Find and delete the enrollment
        Enrollment enrollment = enrollmentRepository.findByGroupAndStudent(group, studentToRemove);
        if (enrollment == null) {
            throw new RuntimeException("Student is not enrolled in this group");
        }
        
        enrollmentRepository.delete(enrollment);
    }

    @Override
    @Transactional
    public void leaveGroup(Long groupId, User student) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        
        // Find and delete the enrollment
        Enrollment enrollment = enrollmentRepository.findByGroupAndStudent(group, student);
        if (enrollment == null) {
            throw new RuntimeException("You are not enrolled in this group");
        }
        
        enrollmentRepository.delete(enrollment);
    }
} 