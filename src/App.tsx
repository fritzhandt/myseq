import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import DefaultPage from "./pages/DefaultPage";
import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import Admin from "./pages/Admin";
import About from "./pages/About";
import Auth from "./pages/Auth";
import ElectedOfficials from "./pages/ElectedOfficials";
import ContactElected from "./pages/ContactElected";
import MyElectedLookup from "./pages/MyElectedLookup";
import RegisterToVote from "./pages/RegisterToVote";
import SpecialEvent from "./pages/SpecialEvent";
import CommunityAlert from "./pages/CommunityAlert";
import Resources from "./pages/Resources";
import Jobs from "./pages/Jobs";
import NotFound from "./pages/NotFound";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DefaultPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/elected-officials" element={<ElectedOfficials />} />
          <Route path="/contact-elected" element={<ContactElected />} />
          <Route path="/my-elected-lookup" element={<MyElectedLookup />} />
          <Route path="/register-to-vote" element={<RegisterToVote />} />
          <Route path="/special-event" element={<SpecialEvent />} />
          <Route path="/community-alert/:id" element={<CommunityAlert />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
