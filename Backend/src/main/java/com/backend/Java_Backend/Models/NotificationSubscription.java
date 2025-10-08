package com.backend.Java_Backend.Models;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "notification_subscription")
public class NotificationSubscription {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "student_id", nullable = false, unique = true)
    private Integer studentID;

    @Column(name = "subscribed", nullable = true)
    private Boolean subscribed;

    public NotificationSubscription() {}

    public NotificationSubscription(Integer studentID, Boolean subscribed) {
        this.studentID = studentID;
        this.subscribed = subscribed;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Integer getStudentID() { return studentID; }
    public void setStudentID(Integer studentID) { this.studentID = studentID; }

    public Boolean getSubscribed() { return subscribed; }
    public void setSubscribed(Boolean subscribed) { this.subscribed = subscribed; }
}
