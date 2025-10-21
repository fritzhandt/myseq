import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommunityAlertBanner from "@/components/CommunityAlertBanner";
import SkipLinks from "@/components/SkipLinks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Keyboard, Eye, Languages } from "lucide-react";

const Accessibility = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Accessibility Statement - My SEQ";
  }, []);

  return (
    <>
      <SkipLinks />
      <div className="min-h-screen flex flex-col">
        <header id="primary-navigation">
          <Navbar />
        </header>
        <CommunityAlertBanner />
        
        <main id="main-content" className="flex-1">
          {/* Back Button */}
          <div className="bg-muted/50 border-b">
            <div className="container mx-auto px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>

          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-6">Accessibility Statement</h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            {/* Commitment Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Our Commitment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  My SEQ (Southeast Queens Information Center) is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
                </p>
                <p>
                  <strong>Current Compliance:</strong> We are committed to conforming with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
                </p>
                <p>
                  <strong>Future Goal:</strong> We are working toward full WCAG 2.2 Level AA compliance by January 1, 2027, in accordance with New York State requirements.
                </p>
              </CardContent>
            </Card>

            {/* Current Features */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Current Accessibility Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span><strong>Keyboard Navigation:</strong> Full keyboard accessibility throughout the site using Tab, Enter, Escape, and Arrow keys</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span><strong>Screen Reader Compatibility:</strong> Optimized for NVDA, JAWS, and VoiceOver screen readers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span><strong>Text Resizing:</strong> Options for normal, large, and extra-large text sizes via the accessibility menu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span><strong>High Contrast Mode:</strong> Color inversion option for enhanced visibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span><strong>Multilingual Support:</strong> Google Translate integration for multiple languages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span><strong>Skip Navigation Links:</strong> Bypass repetitive content and jump directly to main content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span><strong>Clear Focus Indicators:</strong> Visible focus outlines on all interactive elements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span><strong>Semantic HTML:</strong> Proper heading hierarchy and landmark regions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span><strong>Alternative Text:</strong> Descriptive alt text for images and icons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span><strong>Responsive Design:</strong> Mobile-friendly and adaptable to various screen sizes</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Keyboard Shortcuts */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Keyboard Shortcuts
                </CardTitle>
                <CardDescription>
                  Navigate the site efficiently using these keyboard commands
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Tab</span>
                    <span className="text-muted-foreground">Navigate forward through interactive elements</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Shift + Tab</span>
                    <span className="text-muted-foreground">Navigate backward through interactive elements</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Enter / Space</span>
                    <span className="text-muted-foreground">Activate buttons and links</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Escape</span>
                    <span className="text-muted-foreground">Close dialogs and menus</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Arrow Keys</span>
                    <span className="text-muted-foreground">Navigate through menus and dropdown options</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Us About Accessibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We welcome your feedback on the accessibility of My SEQ. If you encounter any accessibility barriers or have suggestions for improvement, please let us know:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium mb-2">Accessibility Contact:</p>
                  <a 
                    href="mailto:mysoutheastqueens@gmail.com?subject=Accessibility%20Inquiry"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    mysoutheastqueens@gmail.com
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please include "Accessibility" in your subject line
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  When reporting an accessibility issue, please include:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>The page or feature where you encountered the issue</li>
                  <li>A description of the accessibility barrier</li>
                  <li>The assistive technology you were using (if applicable)</li>
                  <li>Your contact information for follow-up</li>
                </ul>
              </CardContent>
            </Card>

            {/* Testing & Compliance */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Testing & Continuous Improvement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  <strong>Testing Schedule:</strong> We conduct comprehensive accessibility testing at least every 2 years, and before major updates to the website.
                </p>
                <p>
                  <strong>Testing Methods:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Automated accessibility scanning tools</li>
                  <li>Manual keyboard navigation testing</li>
                  <li>Screen reader compatibility testing</li>
                  <li>User testing with people with disabilities</li>
                  <li>Color contrast verification</li>
                  <li>Mobile responsiveness and touch target testing</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  We are actively working to identify and remediate any accessibility barriers. Known issues and their remediation timelines are tracked and addressed in priority order.
                </p>
              </CardContent>
            </Card>

            {/* Third Party Content */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Third-Party Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Some content on this website is provided by third parties. While we make every effort to ensure all content is accessible, we may not have full control over third-party content. If you encounter accessibility issues with third-party content, please let us know so we can work with the provider to address the issue.
                </p>
              </CardContent>
            </Card>

            {/* Standards & Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Standards & Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  My SEQ aims to conform to the following accessibility standards:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</li>
                  <li>Americans with Disabilities Act (ADA) Title II requirements</li>
                  <li>New York State web accessibility requirements</li>
                  <li>Section 508 of the Rehabilitation Act</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Target Compliance Date for WCAG 2.2 Level AA:</strong> January 1, 2027
                </p>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Accessibility;
