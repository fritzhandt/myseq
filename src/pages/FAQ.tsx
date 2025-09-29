import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CommunityAlertBanner from '@/components/CommunityAlertBanner';
import { TranslatedText } from '@/components/TranslatedText';
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
      answer: "No, we collect absolutely nothing about our users. No personal data, no tracking information, no IP addresses, no search queries, no usage analytics - nothing. Our website is a completely anonymous public information resource. You can browse all community events, resources, and civic information without any data collection or tracking whatsoever. We have no user accounts, no cookies for tracking, and no analytics systems monitoring your activity. However, please note that our AI-powered features use OpenAI's services, which may collect certain information in accordance with their terms of service. You can review OpenAI's data practices at https://openai.com/policies/terms-of-use."
    },
    {
      id: "account-required",
      question: "Do I need an account to use this site?",
      answer: "No, and there are actually no user accounts available. Our website is designed to be a completely open, anonymous resource for community information. You can access all events, resources, and civic information without any registration or sign-up process."
    },
    {
      id: "event-updates",
      question: "How do I stay updated on community events?",
      answer: "You can bookmark our events page and check back regularly, or add our website to your phone's home screen for quick access. We update events frequently and highlight important community happenings on our homepage. Since we don't collect data or offer accounts, checking the site regularly is the best way to stay informed."
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
              <TranslatedText contentKey="faq.back_to_home" pagePath="/faq">
                Back to Home
              </TranslatedText>
            </Button>
            
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <HelpCircle className="w-8 h-8 text-primary" />
                </div>
              </div>
              <TranslatedText 
                contentKey="faq.page_title" 
                pagePath="/faq" 
                as="h1" 
                className="text-4xl font-bold mb-4"
              >
                Frequently Asked Questions
              </TranslatedText>
              <TranslatedText 
                contentKey="faq.page_description" 
                pagePath="/faq" 
                as="p" 
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
              >
                Find answers to common questions about Southeast Queens Resource Center and how we serve our community.
              </TranslatedText>
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
              <TranslatedText 
                contentKey="faq.need_help" 
                pagePath="/faq" 
                as="p" 
                className="text-muted-foreground mb-4"
              >
                Don't see your question answered here?
              </TranslatedText>
              <Button asChild>
                <a href="/contact-elected">
                  <TranslatedText contentKey="faq.contact_officials" pagePath="/faq">
                    Contact Your Elected Officials
                  </TranslatedText>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;