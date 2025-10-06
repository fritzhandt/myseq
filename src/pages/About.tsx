import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CommunityAlertBanner from '@/components/CommunityAlertBanner';

const About = () => {
  const navigate = useNavigate();

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
            <h1 className="text-4xl font-bold mb-8 text-center">About My SEQ</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg mb-6 text-muted-foreground text-center">
              My SEQ is your one-stop shop for discovering community resources, business opportunities, jobs, and information on your elected officials, civics and police precincts.
            </p>
            
            <div className="mb-8">
              <div className="bg-card p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
                <p className="text-muted-foreground">
                  Built and managed by your{' '}
                  <Link to="/contact-elected" className="text-primary hover:text-primary/80 underline underline-offset-4">
                    local elected officials
                  </Link>
                  , My SEQ brings together everything you need to know about Southeast Queens, powered by artificial intelligence. We highlight the most important information, and make use AI to make it as easy as possible to get the information you need.
                </p>
              </div>
            </div>
            
            <div className="bg-muted p-8 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Get Involved</h2>
              <p className="text-muted-foreground">
                Have resources, jobs, suggestions to better My SEQ, or other opportunities? Let us know by contacting us{' '}
                <a 
                  href="mailto:district33@nyassembly.gov?subject=MY%20SEQ%20SUPPORT/INQUIRY" 
                  className="text-primary hover:text-primary/80 underline underline-offset-4"
                >
                  here
                </a>.
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;