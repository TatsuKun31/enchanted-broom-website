import { useEffect, useState } from "react";

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <div className="absolute inset-0 bg-purple-dark/40 dark:bg-purple-dark/60" />
      </div>
      
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl animate-fade-up">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Professional Home Cleaning Services
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Experience the difference with our premium cleaning services. Let us make your home sparkle!
          </p>
          <a
            href="#contact"
            className="inline-block bg-purple-primary hover:bg-purple-primary/90 text-white px-8 py-3 rounded-lg transition-colors"
          >
            Book Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;