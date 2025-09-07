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
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        User user = userServices.login(email, password);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Incorrect email or password");
        }

        return ResponseEntity.ok(user);
    }

    @PostMapping("signUp")
    public ResponseEntity<?> signUp(@RequestParam String name, @RequestParam String email,@RequestParam String phone,@RequestParam String bio,@RequestParam String password){

       /* if (name == null || email == null || name.isEmpty() || surname.isEmpty()) {
            return ResponseEntity.badRequest().body("Name and surname are required");
        }*/

        boolean signup = userServices.signUp(name,email,phone,bio,password);

        if (signup){
            return ResponseEntity.ok("Sign up successfull");
        }else {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("Error trying to sign-up");
        }
    }
}