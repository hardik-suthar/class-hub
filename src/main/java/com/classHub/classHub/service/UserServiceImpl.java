package com.classHub.classHub.service;

import com.classHub.classHub.entity.User;
import com.classHub.classHub.entity.Group;
import com.classHub.classHub.entity.Enrollment;
import com.classHub.classHub.entity.Announcement;
import com.classHub.classHub.entity.Comment;
import com.classHub.classHub.pojoRequest.PostUser;
import com.classHub.classHub.repo.UserRepository;
import com.classHub.classHub.repo.GroupRepository;
import com.classHub.classHub.repo.EnrollmentRepository;
import com.classHub.classHub.repo.AnnouncementRepository;
import com.classHub.classHub.repo.CommentRepository;
import com.classHub.classHub.entity.Role;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Service
public class UserServiceImpl implements UserService{

    private UserRepository userRepository;
    private GroupRepository groupRepository;
    private EnrollmentRepository enrollmentRepository;
    private AnnouncementRepository announcementRepository;
    private CommentRepository commentRepository;
    private PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, 
                          GroupRepository groupRepository,
                          EnrollmentRepository enrollmentRepository,
                          AnnouncementRepository announcementRepository,
                          CommentRepository commentRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.announcementRepository = announcementRepository;
        this.commentRepository = commentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public User registerUser(PostUser postUser) {
        // Validate email is @gmail.com
        if (postUser.getEmail() == null || !postUser.getEmail().toLowerCase().endsWith("@gmail.com")) {
            throw new IllegalArgumentException("Email must be a @gmail.com address.");
        }
        // Check for duplicate email
        if (userRepository.existsByEmail(postUser.getEmail())) {
            throw new IllegalArgumentException("A user with this email already exists. Please use a different @gmail.com address.");
        }
        User user = new User();
        user.setFirstName(postUser.getFirstName());
        user.setLastName(postUser.getLastName());
        user.setEmail(postUser.getEmail());
        user.setPassword(passwordEncoder.encode(postUser.getPassword()));
        user.setRole(Role.valueOf(postUser.getRole().toUpperCase()));
        user.setBio(postUser.getBio());
        return userRepository.save(user);
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return null;
        String email = authentication.getName();
        return userRepository.findByEmail(email);
    }

    @Override
    public boolean isTeacher(User user) {
        return user != null && user.getRole() != null && user.getRole().name().equals("TEACHER");
    }

    @Override
    public boolean isStudent(User user) {
        return user != null && user.getRole() != null && user.getRole().name().equals("STUDENT");
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Delete all comments by this user first
        List<Comment> userComments = commentRepository.findByUser(user);
        for (Comment comment : userComments) {
            commentRepository.delete(comment);
        }
        
        // Delete all announcements by this user (this will cascade to comments)
        List<Announcement> userAnnouncements = announcementRepository.findByTeacher(user);
        for (Announcement announcement : userAnnouncements) {
            // Delete comments for this announcement first
            List<Comment> announcementComments = commentRepository.findByAnnouncement(announcement);
            for (Comment comment : announcementComments) {
                commentRepository.delete(comment);
            }
            announcementRepository.delete(announcement);
        }
        
        // Delete all enrollments for this user
        List<Enrollment> userEnrollments = enrollmentRepository.findByStudent(user);
        for (Enrollment enrollment : userEnrollments) {
            enrollmentRepository.delete(enrollment);
        }
        
        // Delete all groups taught by this user (this will cascade to enrollments and announcements)
        List<Group> userGroups = groupRepository.findByTeacher(user);
        for (Group group : userGroups) {
            // Delete all comments for announcements in this group first
            List<Announcement> groupAnnouncements = announcementRepository.findByGroup(group);
            for (Announcement announcement : groupAnnouncements) {
                commentRepository.deleteByAnnouncement(announcement);
            }
            
            // Delete all announcements for this group
            announcementRepository.deleteByGroup(group);
            
            // Delete all enrollments for this group
            enrollmentRepository.deleteByGroup(group);
            
            // Delete the group
            groupRepository.delete(group);
        }
        
        // Now delete the user
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public User updateUserProfile(PostUser postUser) {
        User currentUser = getCurrentUser();
        if (currentUser == null) throw new RuntimeException("User not found");
        
        if (postUser.getFirstName() != null) currentUser.setFirstName(postUser.getFirstName());
        if (postUser.getLastName() != null) currentUser.setLastName(postUser.getLastName());
        if (postUser.getEmail() != null) currentUser.setEmail(postUser.getEmail());
        if (postUser.getBio() != null) currentUser.setBio(postUser.getBio());
        if (postUser.getPassword() != null) currentUser.setPassword(passwordEncoder.encode(postUser.getPassword()));
        if (postUser.getRole() != null) currentUser.setRole(Role.valueOf(postUser.getRole().toUpperCase()));
        
        return userRepository.save(currentUser);
    }

    @Override
    @Transactional
    public void deleteCurrentUser() {
        User currentUser = getCurrentUser();
        if (currentUser == null) throw new RuntimeException("User not found");
        
        // Delete all comments by this user first
        List<Comment> userComments = commentRepository.findByUser(currentUser);
        for (Comment comment : userComments) {
            commentRepository.delete(comment);
        }
        
        // Delete all announcements by this user (this will cascade to comments)
        List<Announcement> userAnnouncements = announcementRepository.findByTeacher(currentUser);
        for (Announcement announcement : userAnnouncements) {
            // Delete comments for this announcement first
            List<Comment> announcementComments = commentRepository.findByAnnouncement(announcement);
            for (Comment comment : announcementComments) {
                commentRepository.delete(comment);
            }
            announcementRepository.delete(announcement);
        }
        
        // Delete all enrollments for this user
        List<Enrollment> userEnrollments = enrollmentRepository.findByStudent(currentUser);
        for (Enrollment enrollment : userEnrollments) {
            enrollmentRepository.delete(enrollment);
        }
        
        // Delete all groups taught by this user (this will cascade to enrollments and announcements)
        List<Group> userGroups = groupRepository.findByTeacher(currentUser);
        for (Group group : userGroups) {
            // Delete all comments for announcements in this group first
            List<Announcement> groupAnnouncements = announcementRepository.findByGroup(group);
            for (Announcement announcement : groupAnnouncements) {
                commentRepository.deleteByAnnouncement(announcement);
            }
            
            // Delete all announcements for this group
            announcementRepository.deleteByGroup(group);
            
            // Delete all enrollments for this group
            enrollmentRepository.deleteByGroup(group);
            
            // Delete the group
            groupRepository.delete(group);
        }
        
        // Now delete the user
        userRepository.delete(currentUser);
    }

    @Override
    public List<User> findByRole(Role role) {
        return userRepository.findByRole(role);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public User findById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
