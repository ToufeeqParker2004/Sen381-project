package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.TestUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController()
@RequestMapping("/Test")
public class TestRoute {
    @GetMapping()
    public String Test(){
        return "Hello, World this is a test";
    }

    @PostMapping()
    public ResponseEntity<?> TestPost(@RequestBody TestUser user){

        if (user.getName().equals("Trent")){
            if (user.getPassword().equals("Evans")){
                TestUser userr = new TestUser(user.getName(), user.getPassword());
                return ResponseEntity.ok(userr);
            }else {
                return ResponseEntity.status(404).body("Incorrect Details");
            }
        }else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Person doesn't exist");
        }
    }
}
