import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ExternalLink, Vote, Shield, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { TranslatedText } from '@/components/TranslatedText';

const RegisterToVote = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRegisterClick = () => {
    setIsDialogOpen(true);
  };

  const handleProceed = () => {
    window.open('https://nyovr.elections.ny.gov/', '_blank', 'noopener,noreferrer');
    setIsDialogOpen(false);
  };

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
              <TranslatedText 
                contentKey="register_to_vote.back_to_home"
                originalText="Back to Home"
              />
            </Button>
            <div className="text-center mb-12">
            <TranslatedText 
              contentKey="register_to_vote.title"
              originalText="Register to Vote"
              as="h1"
              className="text-4xl font-bold mb-6"
            />
            <TranslatedText 
              contentKey="register_to_vote.subtitle"
              originalText="Your vote is your voice in democracy. Register to vote in New York State and make sure you're ready to participate in upcoming elections."
              as="p"
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            />
            
            {/* Mobile button - shows under subheader on mobile only */}
            <div className="md:hidden mb-8">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="text-lg px-8 py-3" onClick={handleRegisterClick}>
                    <TranslatedText 
                      contentKey="register_to_vote.register_button"
                      originalText="Register to Vote Online"
                    />
                    <ExternalLink className="ml-2 w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      <TranslatedText 
                        contentKey="register_to_vote.leaving_site"
                        originalText="Leaving This Site"
                      />
                    </DialogTitle>
                    <DialogDescription className="text-left">
                      <TranslatedText 
                        contentKey="register_to_vote.external_warning"
                        originalText="This link is taking you to an official New York State website:"
                      />
                      <br />
                      <strong>nyovr.elections.ny.gov</strong>
                      <br /><br />
                      <TranslatedText 
                        contentKey="register_to_vote.privacy_notice"
                        originalText="This is the official New York State online voter registration system maintained by the New York State Board of Elections. Your information will be handled securely according to state privacy policies."
                      />
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      <TranslatedText 
                        contentKey="register_to_vote.cancel"
                        originalText="Cancel"
                      />
                    </Button>
                    <Button onClick={handleProceed}>
                      <TranslatedText 
                        contentKey="register_to_vote.continue"
                        originalText="Continue to NY.gov"
                      />
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card p-6 rounded-lg border">
              <TranslatedText 
                contentKey="register_to_vote.why_register_title"
                originalText="Why Register?"
                as="h2"
                className="text-xl font-semibold mb-4"
              />
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <TranslatedText 
                    contentKey="register_to_vote.reason_1"
                    originalText="• Vote in federal, state, and local elections"
                  />
                </li>
                <li>
                  <TranslatedText 
                    contentKey="register_to_vote.reason_2"
                    originalText="• Have your voice heard on important issues"
                  />
                </li>
                <li>
                  <TranslatedText 
                    contentKey="register_to_vote.reason_3"
                    originalText="• Help choose your representatives"
                  />
                </li>
                <li>
                  <TranslatedText 
                    contentKey="register_to_vote.reason_4"
                    originalText="• Participate in the democratic process"
                  />
                </li>
              </ul>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <TranslatedText 
                contentKey="register_to_vote.eligibility_title"
                originalText="Eligibility Requirements"
                as="h2"
                className="text-xl font-semibold mb-4"
              />
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <TranslatedText 
                    contentKey="register_to_vote.requirement_1"
                    originalText="• Be a U.S. citizen"
                  />
                </li>
                <li>
                  <TranslatedText 
                    contentKey="register_to_vote.requirement_2"
                    originalText="• Be 18 years old by Election Day"
                  />
                </li>
                <li>
                  <TranslatedText 
                    contentKey="register_to_vote.requirement_3"
                    originalText="• Be a resident of New York State"
                  />
                </li>
                <li>
                  <TranslatedText 
                    contentKey="register_to_vote.requirement_4"
                    originalText="• Not be in prison for a felony conviction"
                  />
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center hidden md:block">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="text-lg px-8 py-3" onClick={handleRegisterClick}>
                  <TranslatedText 
                    contentKey="register_to_vote.register_button"
                    originalText="Register to Vote Online"
                  />
                  <ExternalLink className="ml-2 w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    <TranslatedText 
                      contentKey="register_to_vote.leaving_site"
                      originalText="Leaving This Site"
                    />
                  </DialogTitle>
                  <DialogDescription className="text-left">
                    <TranslatedText 
                      contentKey="register_to_vote.external_warning"
                      originalText="This link is taking you to an official New York State website:"
                    />
                    <br />
                    <strong>nyovr.elections.ny.gov</strong>
                    <br /><br />
                    <TranslatedText 
                      contentKey="register_to_vote.privacy_notice"
                      originalText="This is the official New York State online voter registration system maintained by the New York State Board of Elections. Your information will be handled securely according to state privacy policies."
                    />
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    <TranslatedText 
                      contentKey="register_to_vote.cancel"
                      originalText="Cancel"
                    />
                  </Button>
                  <Button onClick={handleProceed}>
                    <TranslatedText 
                      contentKey="register_to_vote.continue"
                      originalText="Continue to NY.gov"
                    />
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-12 bg-muted p-6 rounded-lg">
            <TranslatedText 
              contentKey="register_to_vote.info_title"
              originalText="Important Information"
              as="h2"
              className="text-lg font-semibold mb-4"
            />
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>
                  <TranslatedText 
                    contentKey="register_to_vote.deadline_label"
                    originalText="Registration Deadlines:"
                  />
                </strong> <TranslatedText 
                  contentKey="register_to_vote.deadline_text"
                  originalText="You must register at least 25 days before an election to be eligible to vote in that election."
                />
              </p>
              <p>
                <strong>
                  <TranslatedText 
                    contentKey="register_to_vote.help_label"
                    originalText="Need Help?"
                  />
                </strong> <TranslatedText 
                  contentKey="register_to_vote.help_text"
                  originalText="If you need assistance with voter registration or have questions about the voting process, contact your local Board of Elections."
                />
              </p>
              <p>
                <strong>
                  <TranslatedText 
                    contentKey="register_to_vote.already_label"
                    originalText="Already Registered?"
                  />
                </strong> <TranslatedText 
                  contentKey="register_to_vote.already_text"
                  originalText="You can check your registration status and find your polling place on the same NY.gov website."
                />
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterToVote;