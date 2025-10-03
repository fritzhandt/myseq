import { createContext, useContext, useState, ReactNode } from 'react';

interface NavbarContextType {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const NavbarProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen(prev => !prev);

  return (
    <NavbarContext.Provider value={{ isOpen, openMenu, closeMenu, toggleMenu }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};
