import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Info, Users, Mail, Search, Vote, Shield, Calendar, Briefcase, Home, Building2, HelpCircle } from 'lucide-react';
import AddToHomeButton from '@/components/AddToHomeButton';
import { LanguageSelector } from '@/components/LanguageSelector';
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);
  return <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo/Site Name */}
          <Link to="/" className="text-lg sm:text-xl font-bold text-primary">
            <span className="hidden sm:inline font-oswald text-black font-semibold uppercase">Southeast Queens Resource Center</span>
            <span className="sm:hidden font-oswald text-black font-semibold uppercase">SEQ Resource Center</span>
          </Link>

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <AddToHomeButton />
            
            {/* Hamburger Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px] p-0 flex flex-col h-full max-h-screen">
              {/* Header */}
              <div className="px-6 py-6 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex-shrink-0">
                <h2 className="font-oswald text-xl font-semibold text-foreground uppercase tracking-wide">
                  Southeast Queens Resource Center
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Navigate your community</p>
              </div>

              {/* Menu Items - Scrollable */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 min-h-0">
                <nav className="space-y-2 pb-4">
                  {/* Main Sections */}
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-4">
                      Main Sections
                    </h3>
                    <div className="space-y-1">
                      <Link 
                        to="/home" 
                        className="flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 group" 
                        onClick={closeMenu}
                      >
                        <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span>Community Events</span>
                      </Link>
                      
                      <Link 
                        to="/resources" 
                        className="flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 group" 
                        onClick={closeMenu}
                      >
                        <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                          <Users className="w-4 h-4" />
                        </div>
                        <span>Community Resources</span>
                      </Link>
                      
                      <Link 
                        to="/civics" 
                        className="flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 group" 
                        onClick={closeMenu}
                      >
                        <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span>Civic Organizations</span>
                      </Link>
                      
                      <Link 
                        to="/jobs" 
                        className="flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 group" 
                        onClick={closeMenu}
                      >
                        <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <span>Career Opportunities</span>
                      </Link>
                    </div>
                  </div>

                  {/* Other Pages */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-4">
                      More Pages
                    </h3>
                    <div className="space-y-1">
                      <Link 
                        to="/about" 
                        className="flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 group" 
                        onClick={closeMenu}
                      >
                        <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                          <Info className="w-4 h-4" />
                        </div>
                        <span>About</span>
                      </Link>
                      
                      <Link 
                        to="/faq" 
                        className="flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 group" 
                        onClick={closeMenu}
                      >
                        <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <span>FAQ</span>
                      </Link>
                  
                      <Link 
                        to="/contact-elected" 
                        className="flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 group" 
                        onClick={closeMenu}
                      >
                        <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                          <Mail className="w-4 h-4" />
                        </div>
                        <span>Contact Your Elected</span>
                      </Link>
                      
                      <Link 
                        to="/my-elected-lookup" 
                        className="flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 group" 
                        onClick={closeMenu}
                      >
                        <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                          <Search className="w-4 h-4" />
                        </div>
                        <span>My Elected Lookup</span>
                      </Link>
                      
                      <Link 
                        to="/register-to-vote" 
                        className="flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 group" 
                        onClick={closeMenu}
                      >
                        <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                          <Vote className="w-4 h-4" />
                        </div>
                        <span>Register to Vote</span>
                      </Link>
                  
                      <Link 
                        to="/police-precincts" 
                        className="flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 group" 
                        onClick={closeMenu}
                      >
                        <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                          <Shield className="w-4 h-4" />
                        </div>
                        <span>Police Precincts</span>
                      </Link>
                    </div>
                  </div>
                </nav>
              </div>
            </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navbar;