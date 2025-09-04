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
  - Docker + Kubernetes for containerization & auto-scaling  
  - JWT for secure token-based authentication  
  - React Query / Axios for efficient API handling  
  - Lombok for reduced boilerplate code in Java  
  - JUnit, Jest + React Testing Library for testing

---

### Features of Application (In progress/can change)

#### Student Registration & Profile Management
- **Login:** Google OAuth 2.0 restricted to `@belgiumcampus.ac.za` domain.  
- **Profile:** Academic info collection (degree, year, modules), editable profile and interests.  
- **Subscriptions & Tracking:** Subscribe to topics/tutors, store interaction history.  

#### Tutor & Topic Management
- **Tutor Validation:** Only verified tutors can create/respond to topics.  
- **Topics:** Create topics with title, description, module, difficulty.  
- **Student Interaction:** Receive notifications, upload study materials (PDF, video, slides), provide structured answers.  

#### Content Storage & Access
- **Uploads:** Students (questions) & tutors (resources), supports PDF, DOCX, PPT, MP4, MP3, images, HTML5 exercises.  
- **Organization:** Tagged by module, tutor, topic; searchable by keywords/tags.  
- **Device Support:** Mobile-friendly, offline viewing.  

#### Discussion Forum
- **Anonymous Posting:** Students post anonymously, linked internally for moderation.  
- **Interaction:** Replies, threads, likes/upvotes, tagging tutors.  
- **Moderation:** Admins can delete/flag posts; AI-assisted moderation.  

#### AI-Powered Chatbot Assistant
- **Scope:** FAQ handling, study support, references stored resources.  
- **Escalation:** Low confidence queries routed to human tutor.  
- **Learning:** Improves with feedback (thumbs up/down).  

#### Private Messaging
- **One-on-One Channels:** Auto-created chat with verified tutors.  
- **Messaging:** Text, attachments (PDF, images, links), inline previews.  

#### API Notifications
- **Integration:** Email (SendGrid), SMS/WhatsApp (Twilio API).  
- **Use Cases:** Notify students of tutor replies, reminders, announcements.  

#### Real-Time Meetings
- **Built-In Module:** Embedded video/audio conferencing (WebRTC).  
- **Features:** Screen sharing, whiteboard, breakout rooms, recording.  

#### Admin Panel 
   - Manage users, sessions, and reports (optional for MVP)

---
