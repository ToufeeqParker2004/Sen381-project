package com.backend.Java_Backend.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/error")
public class TestController {
    @GetMapping("/test-error")
    public void testError() {
        throw new RuntimeException("Test error for GlobalExceptionHandler");
    }
}
