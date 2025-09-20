import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
            <h1 className="text-4xl font-bold mb-8 text-center">About NYC Community Events</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg mb-6 text-muted-foreground">
              NYC Community Events is your go-to platform for discovering and participating in 
              community activities across New York City. We believe in the power of bringing 
              people together to build stronger, more connected neighborhoods.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-card p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-muted-foreground">
                  To connect New Yorkers with meaningful community events and foster civic 
                  engagement through accessible, age-appropriate programming that brings 
                  residents and their elected officials together.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
                <p className="text-muted-foreground">
                  We organize and promote community events for all age groups, from grade 
                  school activities to senior programs, ensuring every New Yorker has 
                  opportunities to engage with their community and local government.
                </p>
              </div>
            </div>
            
            <div className="bg-muted p-8 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Get Involved</h2>
              <p className="text-muted-foreground mb-4">
                Join us in building stronger communities! Whether you're looking to attend events, 
                volunteer, or learn more about your elected officials, there's a place for you 
                in our community.
              </p>
              <p className="text-muted-foreground">
                Stay connected with your neighbors, meet your representatives, and make your 
                voice heard in the democratic process.
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