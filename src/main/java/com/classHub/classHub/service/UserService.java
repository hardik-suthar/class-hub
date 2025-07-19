package com.classHub.classHub.service;

import com.classHub.classHub.entity.Role;
import com.classHub.classHub.entity.User;
import com.classHub.classHub.pojoRequest.PostUser;

import java.util.List;

public interface UserService {

    User registerUser(PostUser postUser);
    User getCurrentUser();
    boolean isTeacher(User user);
    boolean isStudent(User user);
    List<User> getAllUsers();
    void deleteUser(Long userId);
    User updateUserProfile(PostUser postUser);
    void deleteCurrentUser();
    List<User> findByRole(Role role);
    boolean existsByEmail(String email);
    User findById(Long id);
}
