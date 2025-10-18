import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Tutors from "./pages/Tutors";
import Forum from "./pages/Forum";
import ForumPost from "./pages/ForumPost";
import Messages from "./pages/Messages";
import Resources from "./pages/Resources";
import AITutor from "./pages/AITutor";
import ResourceDetail from "./pages/ResourceDetail";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import TutorApplications from "./pages/TutorApplications";
import Tutor from "./pages/Tutor";
import ContentUpload from "./pages/tutor/ContentUpload";
import MyStudents from "./pages/tutor/MyStudents";
import MyEvents from "./pages/tutor/MyEvents";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProgressPage from "./pages/Progress";
import { NotificationsPage } from "./pages/notifications";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/tutors" element={<Tutors />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/post" element={<ForumPost />} />
        <Route path="/forum/post/:id" element={<ForumPost />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />
        <Route path="/ai-tutor" element={<AITutor />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/tutor-applications" element={<TutorApplications />} />
        <Route path="/tutor" element={<Tutor />} />
        <Route path="/tutor/content" element={<ContentUpload />} />
        <Route path="/tutor/students" element={<MyStudents />} />
        <Route path="/tutor/events" element={<MyEvents />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/student-progress" element={<ProgressPage/>}/>
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </MainLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;