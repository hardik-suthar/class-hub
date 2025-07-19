package com.classHub.classHub.controller;

import com.classHub.classHub.config.JwtUtil;
import com.classHub.classHub.entity.Role;
import com.classHub.classHub.entity.User;
import com.classHub.classHub.repo.UserRepository;
import com.classHub.classHub.pojoRequest.AuthRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;


@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthRequest req) {
        System.out.println("[REGISTER] Email: " + req.getEmail());
        System.out.println("[REGISTER] Raw Password: " + req.getPassword());
        
        // Check if email is a gmail address
        if (req.getEmail() == null || !req.getEmail().toLowerCase().endsWith("@gmail.com")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Email must be a @gmail.com address.");
        }
        // Check if email already exists
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("A user with this email already exists. Please use a different @gmail.com address.");
        }
        
        User user = new User();
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        String encodedPassword = passwordEncoder.encode(req.getPassword());
        user.setPassword(encodedPassword);
        System.out.println("[REGISTER] Encoded Password: " + encodedPassword);
        user.setBio(req.getBio());
        if (req.getRole() == null ||
            !(req.getRole().equalsIgnoreCase("STUDENT") || req.getRole().equalsIgnoreCase("TEACHER"))) {
            user.setRole(Role.STUDENT);
        } else {
            user.setRole(Role.valueOf(req.getRole().toUpperCase()));
        }
        userRepository.save(user);
        System.out.println("[REGISTER] User saved: " + user.getEmail());
        return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AuthRequest req) {
        System.out.println("[LOGIN] Attempt Email: " + req.getEmail());
        System.out.println("[LOGIN] Attempt Raw Password: " + req.getPassword());
        User dbUser = userRepository.findByEmail(req.getEmail());
        if (dbUser == null) {
            System.out.println("[LOGIN] No user found for email: " + req.getEmail());
        } else {
            System.out.println("[LOGIN] DB Encoded Password: " + dbUser.getPassword());
            boolean match = passwordEncoder.matches(req.getPassword(), dbUser.getPassword());
            System.out.println("[LOGIN] Password match: " + match);
        }
        if (dbUser != null && passwordEncoder.matches(req.getPassword(), dbUser.getPassword())) {
            String token = jwtUtil.generateToken(dbUser.getEmail(), dbUser.getRole().name());
            return ResponseEntity.ok(token);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("ClassHub API is running!");
    }
} 