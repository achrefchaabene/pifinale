import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";

// User pages
import UserOverview from "./pages/user/UserOverview";

import UserUpload from "./pages/user/UserUpload";
import UserHistory from "./pages/user/UserHistory";
import UserProfile from "./pages/user/UserProfile";
import ConversationsPage from "./pages/user/ConversationsPage";
import ChatbotPage from "./pages/user/ChatbotPage";
import UserJournal from "./pages/user/UserJournal";
import UserLearnMore from "./pages/user/UserLearnMore";

// Doctor pages
import DoctorOverview from "./pages/doctor/DoctorOverview";
import PatientManagement from "./pages/doctor/PatientManagement";
import PatientDetails from "./pages/doctor/PatientDetails";
import AdvancedAnalysis from "./pages/doctor/AdvancedAnalysis";
import AIInsights from "./pages/doctor/AIInsights";
import Reports from "./pages/doctor/Reports";
import DoctorConversationsPage from "./pages/doctor/ConversationsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PwaInstallPrompt />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Patient dashboard */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<UserOverview />} />
              <Route path="overview" element={<UserOverview />} />
              <Route path="upload" element={<UserUpload />} />
              <Route path="history" element={<UserHistory />} />
              <Route path="journal" element={<UserJournal />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="conversations" element={<ConversationsPage />} />
              <Route path="learn-more" element={<UserLearnMore />} />
              <Route path="chatbot" element={<ChatbotPage />} />
            </Route>

            {/* Doctor dashboard */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DoctorOverview />} />
              <Route path="patients" element={<PatientManagement />} />
              <Route path="patients/:id" element={<PatientDetails />} />
              <Route path="chatbot" element={<ChatbotPage />} />
              <Route path="analysis" element={<AdvancedAnalysis />} />
              <Route path="insights" element={<AIInsights />} />
              <Route path="reports" element={<Reports />} />
              <Route path="conversations" element={<DoctorConversationsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
