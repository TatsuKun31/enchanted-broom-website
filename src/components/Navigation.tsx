import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="text-2xl font-bold text-purple-primary">CleanCo</div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-purple-primary"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-8">
            <a href="#services" className="text-purple-dark hover:text-purple-primary transition-colors">Services</a>
            <a href="#why-us" className="text-purple-dark hover:text-purple-primary transition-colors">Why Us</a>
            <a href="#contact" className="text-purple-dark hover:text-purple-primary transition-colors">Contact</a>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <a href="#services" className="text-purple-dark hover:text-purple-primary transition-colors">Services</a>
              <a href="#why-us" className="text-purple-dark hover:text-purple-primary transition-colors">Why Us</a>
              <a href="#contact" className="text-purple-dark hover:text-purple-primary transition-colors">Contact</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;