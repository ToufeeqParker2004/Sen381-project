package com.backend.Java_Backend.Security;

import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

//        if (authHeader != null && authHeader.startsWith("Bearer ")) {
//            String token = authHeader.substring(7);
//            try {
//                DecodedJWT decodedJWT = JwtUtil.verifyToken(token);
//                String studentId = decodedJWT.getSubject(); // keep as String
//                UsernamePasswordAuthenticationToken auth =
//                        new UsernamePasswordAuthenticationToken(studentId, null, Collections.emptyList());
//                SecurityContextHolder.getContext().setAuthentication(auth);
//            } catch (Exception e) {
//                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//                response.getWriter().write("Invalid JWT token");
//                return;
//            }
//        } else if (!request.getRequestURI().equals("/student/login")) {
//            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//            response.getWriter().write("Missing JWT token");
//            return;
//        }

        filterChain.doFilter(request, response);
    }

}
