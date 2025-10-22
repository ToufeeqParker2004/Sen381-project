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

# Insights

# Student side

<img width="1911" height="987" alt="Student Dash" src="https://github.com/user-attachments/assets/f8d54078-cb56-42c2-b940-8c8425792688" />
<img width="1910" height="988" alt="StudentMessage" src="https://github.com/user-attachments/assets/b08647fa-a9c1-4f74-bf60-3dcf714e7773" />
<img width="1908" height="995" alt="Forum" src="https://github.com/user-attachments/assets/ecd79ddd-dbed-4381-bbe4-0f1e457f3e45" />
<img width="1906" height="991" alt="ProgressPage" src="https://github.com/user-attachments/assets/ea70b9fb-a51d-4f7d-81fe-9fbd583d51fc" />
<img width="1916" height="992" alt="TutorBooking" src="https://github.com/user-attachments/assets/c29da8a6-bb54-4024-9790-03ef2ddc0391" />


# Tutor side

<img width="1915" height="990" alt="TutorDash" src="https://github.com/user-attachments/assets/41fa92eb-e2ec-4d84-80d8-bc6955bb9a17" />
<img width="1911" height="988" alt="MyStudents" src="https://github.com/user-attachments/assets/89b22a4e-2210-4182-babd-7fc4db06e8b0" />


# Admin side

<img width="1910" height="993" alt="AdminDash" src="https://github.com/user-attachments/assets/839b8e4a-2523-468e-b0c5-992d1bad8b7e" />


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






