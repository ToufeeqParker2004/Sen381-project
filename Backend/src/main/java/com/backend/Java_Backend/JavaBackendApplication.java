package com.backend.Java_Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class JavaBackendApplication implements WebMvcConfigurer {

	public static void main(String[] args) {



        ConfigurableApplicationContext context = SpringApplication.run(JavaBackendApplication.class, args);
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Shutting down and closing DB connections...");
            context.close(); // closes Hikari pool + JPA connections
        }));
	}
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")
				.allowedOrigins("http://localhost:8081","http://localhost:8080") // your frontend
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
				.allowedHeaders("*")  // allow Authorization header
				.exposedHeaders("Authorization"); // optional if backend sets Authorization
	}


}