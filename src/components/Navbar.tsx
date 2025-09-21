import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Info, Users, Mail, Search, Vote } from 'lucide-react';
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);
  return <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo/Site Name */}
          <Link to="/" className="text-lg sm:text-xl font-bold text-primary">
            <span className="hidden sm:inline font-oswald text-black font-semibold uppercase">Southeast Queens Events</span>
            <span className="sm:hidden font-oswald text-black font-semibold uppercase">SEQ Events</span>
          </Link>

          {/* Hamburger Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                <Link to="/about" className="text-base sm:text-lg font-medium hover:text-primary transition-colors py-2 flex items-center gap-3" onClick={closeMenu}>
                  <Info className="w-5 h-5" />
                  About
                </Link>
                <Link to="/elected-officials" className="text-base sm:text-lg font-medium hover:text-primary transition-colors py-2 flex items-center gap-3" onClick={closeMenu}>
                  <Users className="w-5 h-5" />
                  Elected Officials
                </Link>
                <Link to="/contact-elected" className="text-base sm:text-lg font-medium hover:text-primary transition-colors py-2 flex items-center gap-3" onClick={closeMenu}>
                  <Mail className="w-5 h-5" />
                  Contact Your Elected
                </Link>
                <Link to="/my-elected-lookup" className="text-base sm:text-lg font-medium hover:text-primary transition-colors py-2 flex items-center gap-3" onClick={closeMenu}>
                  <Search className="w-5 h-5" />
                  My Elected Lookup
                </Link>
                <Link to="/register-to-vote" className="text-base sm:text-lg font-medium hover:text-primary transition-colors py-2 flex items-center gap-3" onClick={closeMenu}>
                  <Vote className="w-5 h-5" />
                  Register to Vote
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>;
};
export default Navbar;