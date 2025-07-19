package com.classHub.classHub.repo;

import com.classHub.classHub.entity.User;
import com.classHub.classHub.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    List<User> findByRole(Role role);
    boolean existsByEmail(String email);
    Optional<User> findById(Long id);
}
