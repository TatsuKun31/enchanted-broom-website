import { useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate('/auth');
  };

  return (
    <nav className="fixed w-full bg-white/90 dark:bg-purple-dark/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="text-2xl font-bold text-purple-primary">CleanCo</div>
          
          <div className="flex items-center gap-4">
            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors">Services</a>
              <a href="#why-us" className="text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors">Why Us</a>
              <button 
                onClick={handleBookNow}
                className="bg-purple-primary hover:bg-purple-primary/90 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              >
                Book Now
              </button>
            </div>
            
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-purple-primary"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <a href="#services" className="text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors">Services</a>
              <a href="#why-us" className="text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors">Why Us</a>
              <button 
                onClick={handleBookNow}
                className="bg-purple-primary hover:bg-purple-primary/90 text-white px-6 py-2 rounded-lg transition-all duration-300 w-full"
              >
                Book Now
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;