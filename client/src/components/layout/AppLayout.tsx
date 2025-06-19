import React, { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import MobileNav from './MobileNav';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden md:flex" />
      
      {/* Mobile menu - shown when menu button is clicked */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu}></div>
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white dark:bg-gray-800 overflow-y-auto">
            <Sidebar className="flex" mobileView onClose={toggleMobileMenu} />
          </div>
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <TopNavbar onMenuClick={toggleMobileMenu} />
        
        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
        
        {/* Mobile bottom navigation */}
        <MobileNav />
      </div>
    </div>
  );
};

export default AppLayout;
