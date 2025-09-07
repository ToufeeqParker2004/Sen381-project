package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.Models.User;
import com.backend.Java_Backend.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.time.LocalDateTime;

@Service
public class UserServices {

    private final UserRepository userRepository;

    public UserServices(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User login(String email, String password) {
        User user = userRepository.login(email, password);

        if (user !=null){
            return user;
        }else {
            return null;
        }

    }

    public boolean signUp(String name, String email, String phone, String bio, String password) {
        return userRepository.signUp(name, email, phone, bio, password);
    }

}