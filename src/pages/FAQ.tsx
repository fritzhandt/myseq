import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CommunityAlertBanner from '@/components/CommunityAlertBanner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      id: "data-collection",
      question: "Do you collect any data on me?",
      answer: "We prioritize your privacy and data security. We use Supabase for secure data storage and OpenAI for AI-powered features. Your personal information is stored securely and we never sell or share it with third parties. Our service providers (Supabase and OpenAI) may collect operational data to maintain and improve their services, but you control your account data and can request deletion at any time. We only collect information necessary to provide you with community resources and event updates."
    },
    {
      id: "account-required",
      question: "Do I need an account to use this site?",
      answer: "No account is required to browse community events, resources, and information. However, creating an account allows you to receive personalized updates, save favorite events, and access additional features like event notifications and community alerts."
    },
    {
      id: "event-updates",
      question: "How do I stay updated on community events?",
      answer: "You can browse our events page regularly, create an account for personalized notifications, or check our community announcements. We update events frequently and highlight important community happenings on our homepage."
    },
    {
      id: "resource-suggestions",
      question: "Can I suggest new resources to be added?",
      answer: "Yes! We welcome community input. You can contact your elected officials through our 'Contact Your Elected' page to suggest new resources, programs, or services that would benefit Southeast Queens residents."
    },
    {
      id: "mobile-app",
      question: "Is there a mobile app?",
      answer: "While we don't have a dedicated mobile app, our website is fully mobile-responsive and works great on all devices. You can also add our site to your phone's home screen for easy access - look for the 'Add to Home Screen' option when browsing on mobile."
    },
    {
      id: "technical-issues",
      question: "What should I do if I encounter technical issues?",
      answer: "If you experience any technical problems with the website, please contact your local elected officials through our contact page. We work to resolve issues quickly to ensure you have the best experience accessing community information."
    },
    {
      id: "information-accuracy",
      question: "How do I know the information is accurate and up-to-date?",
      answer: "Our platform is built and managed by your local elected officials who work directly with community organizations to ensure accuracy. Event and resource information is regularly updated, but we recommend verifying details directly with organizations for the most current information."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CommunityAlertBanner />
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <HelpCircle className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find answers to common questions about Southeast Queens Resource Center and how we serve our community.
              </p>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">
                Don't see your question answered here?
              </p>
              <Button asChild>
                <a href="/contact-elected">Contact Your Elected Officials</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;