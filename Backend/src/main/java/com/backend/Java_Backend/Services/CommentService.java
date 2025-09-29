package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.Models.Comment;
import com.backend.Java_Backend.Models.ForumPost;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Repository.CommentRepository;
import com.backend.Java_Backend.Repository.ForumPostRepository;
import com.backend.Java_Backend.Repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final ForumPostRepository forumPostRepository;
    private final StudentRepository studentRepository;

    public CommentService(CommentRepository commentRepository,
                          ForumPostRepository forumPostRepository,
                          StudentRepository studentRepository) {
        this.commentRepository = commentRepository;
        this.forumPostRepository = forumPostRepository;
        this.studentRepository = studentRepository;
    }

    public List<Comment> getCommentsByPostId(UUID postId) {
        return commentRepository.findByForumPostId(postId);
    }

    public Comment addComment(UUID postId, int studentId, String content) {
        Optional<ForumPost> postOpt = forumPostRepository.findById(postId);
        Optional<Student> studentOpt = studentRepository.findById(studentId);

        if (postOpt.isEmpty() || studentOpt.isEmpty()) {
            throw new IllegalArgumentException("Post or student not found");
        }

        Comment comment = new Comment();
        comment.setForumPost(postOpt.get());
        comment.setStudent(studentOpt.get());
        comment.setContent(content);

        return commentRepository.save(comment);
    }
}
