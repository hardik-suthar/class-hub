package com.classHub.classHub.service;

import com.classHub.classHub.entity.User;
import com.classHub.classHub.entity.UserPrincipal;
import com.classHub.classHub.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email);

        if(user == null) throw new UsernameNotFoundException("User with given email id not found");

        return new UserPrincipal(user);
    }
}
