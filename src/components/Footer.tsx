import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">My SEQ</h2>
            <p className="text-sm text-muted-foreground">
              Southeast Queens Information Center - Your comprehensive resource for community information, events, jobs, and civic organizations.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact-elected" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Elected Officials
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  Accessibility Statement
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Contact Us</h2>
            <div className="space-y-2">
              <a 
                href="mailto:mysoutheastqueens@gmail.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email us at mysoutheastqueens@gmail.com"
              >
                <Mail className="h-4 w-4" />
                mysoutheastqueens@gmail.com
              </a>
              <p className="text-sm text-muted-foreground mt-4">
                For accessibility assistance or alternative formats, please contact us via email.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              © {currentYear} My SEQ. All rights reserved.
            </p>
            <p>
              Committed to WCAG 2.1 Level AA compliance | Target: WCAG 2.2 Level AA by January 1, 2027
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
