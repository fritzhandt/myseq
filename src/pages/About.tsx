import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SkipLinks from '@/components/SkipLinks';
import CommunityAlertBanner from '@/components/CommunityAlertBanner';
import { useEffect } from 'react';

const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "About - My SEQ";
  }, []);

  return (
    <>
      <SkipLinks />
      <div className="min-h-screen flex flex-col">
        <header id="primary-navigation">
          <Navbar />
        </header>
        <CommunityAlertBanner />
        <main id="main-content" className="py-16 flex-1">
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
                  href="mailto:mysoutheastqueens@gmail.com?subject=MY%20SEQ%20SUPPORT/INQUIRY" 
                  className="text-primary hover:text-primary/80 underline underline-offset-4"
                >
                  here
                </a>.
              </p>
            </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
};

export default About;