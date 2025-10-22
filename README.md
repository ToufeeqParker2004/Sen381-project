# 🎓 Belgium Campus Tutoring App (SEN381 Project)

## 🚀 Project Overview
The **Belgium Campus Tutoring App** is a full-featured platform designed for students and tutors to collaborate efficiently. It enables **student registration, tutor management, content sharing, real-time communication, AI assistance, and notifications**, all in a **secure and scalable environment**.  

This project is part of the **SEN381 Software Engineering Project** and leverages **modern web technologies** to deliver a seamless tutoring experience.

---

## 👥 Group Members
- **Trent Evans**  
- **Jason Lee Taylor**  
- **Muhammad Toufeeq Parker**  
- **Gito Martin**  
- **Renaldo Jardim**

---

## 🛠 Tech Stack
- **Backend:** Java Spring Boot  
- **Frontend:** React + TypeScript  
- **Database / Auth / Realtime:** Supabase  
- **Build Tool:** Maven  
- **Styling:** HTML + TailwindCSS  
- **Other**   
  - JWT for secure token-based authentication  
  - React Query / Axios for efficient API handling   
  - JUnit tests

---

### Features of Application (In progress/can change)

#### Student Profile Management
- **Login:** restricted to `@belgiumcampus.ac.za` domain.  
- **Profile:** Academic info collection (degree, year, modules), editable profile and interests.  
- **Subscriptions & Tracking:** Subscribe to topics/tutors, store interaction history.  

#### Tutor & Topic Management
- **Tutor Validation:** Only verified tutors can create/respond to topics.  
- **Topics:** Create topics with title, description, module, difficulty.  
- **Student Interaction:** Receive notifications, upload study materials (PDF, video, slides), provide structured answers.
- **Bookings:** Allow students to book verified tutors and recieve analytics from booking sessions and attending them.

#### Content Storage & Access
- **Uploads:** Students (questions) & tutors (resources), supports PDF, DOCX, PPT, MP4, MP3, images, HTML5 exercises.  
- **Organization:** Tagged by module, tutor, topic.  

#### Discussion Forum 
- **Interaction:** Replies, threads, Community chats etc  
- **Moderation:** Admins can delete posts, NLP AI-assisted moderation.  

#### AI-Powered Chatbot Assistant
- **Scope:** FAQ handling, study support, references stored resources.  
- **Escalation:** Low confidence queries routed to human tutor.  
- **Learning:** Improves with feedback (thumbs up/down).  

#### Private Messaging
- **One-on-One Channels:** Auto-created chat with verified tutors and students.  

#### API Notifications
- **Integration:** EmailJS
- **Use Cases:** Notify students of tutor booking states.  

#### Admin Panel 
   - Manage analytics, users, Forum posts, FAQ's, Errors

---
