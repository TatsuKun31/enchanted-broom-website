import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl animate-fade-up">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Professional Home Cleaning Services
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Experience the difference with our premium cleaning services. Let us make your home sparkle!
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="inline-block bg-purple-primary hover:bg-purple-primary/90 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;