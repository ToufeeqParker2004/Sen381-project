package com.backend.Java_Backend.Models;


import jakarta.persistence.*;

@Entity
@Table(name = "student_events")
public class StudentEvent {
    @EmbeddedId
    private StudentEventId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentId")
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("eventId")
    @JoinColumn(name = "event_id")
    private Events event;

    public  StudentEvent(){}

    public StudentEvent( Student student , Events event) {
        this.student = student;
        this.event = event;
        this.id = new StudentEventId(student.getId(),event.getId());
    }

    // Getters and setters
    public StudentEventId getId() {
        return id;
    }

    public void setId(StudentEventId id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Events getEvent() {
        return event;
    }

    public void setEvent(Events event) {
        this.event = event;
    }
}
