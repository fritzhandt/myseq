import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Site Name */}
          <Link to="/" className="text-xl font-bold text-primary">
            NYC Community Events
          </Link>

          {/* Hamburger Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                <Link
                  to="/about"
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={closeMenu}
                >
                  About
                </Link>
                <Link
                  to="/elected-officials"
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={closeMenu}
                >
                  Elected Officials
                </Link>
                <Link
                  to="/my-elected-lookup"
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={closeMenu}
                >
                  My Elected Lookup
                </Link>
                <Link
                  to="/register-to-vote"
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={closeMenu}
                >
                  Register to Vote
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;