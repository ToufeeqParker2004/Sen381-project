package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.User;
import com.backend.Java_Backend.Services.UserServices;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserServices userServices;

    public UserController(UserServices userServices) {
        this.userServices = userServices;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String name, @RequestParam String surname) {
        User user = userServices.login(name, surname);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Incorrect name or surname");
        }

        return ResponseEntity.ok(user);
    }

    @PostMapping("signUp")
    public ResponseEntity<?> signUp(@RequestParam String name, @RequestParam String surname){

        if (name == null || surname == null || name.isEmpty() || surname.isEmpty()) {
            return ResponseEntity.badRequest().body("Name and surname are required");
        }

        boolean signup = userServices.signUp(name,surname);

        if (signup){
            return ResponseEntity.ok("Sign up successfull");
        }else {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("Error trying to sign-up");
        }
    }
}