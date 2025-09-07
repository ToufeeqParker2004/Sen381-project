package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.Models.User;
import com.backend.Java_Backend.Repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserServices {

    private final UserRepository userRepository;

    public UserServices(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User login(String name, String surname) {
        User user = userRepository.login(name, surname);

        if (user !=null){
            return user;
        }else {
            return null;
        }

    }

    public boolean signUp(String name, String surname) {
        return userRepository.signUp(name, surname);
    }
}