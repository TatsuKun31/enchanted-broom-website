import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import WhyChooseUs from "@/components/WhyChooseUs";
import { useEffect, useState } from "react";

const Index = () => {
  const [scrollY, setScrollY] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = '/lovable-uploads/974ff095-0122-4262-8a7c-b919b2beda9f.png';
    img.onload = () => setImageLoaded(true);
  }, []);

  const services = [
    {
      title: "Basic Clean",
      description: "Perfect for regular maintenance",
      price: "$120",
      features: [
        "Dusting and vacuuming",
        "Bathroom cleaning",
        "Kitchen cleaning",
        "Floor mopping",
      ],
    },
    {
      title: "Deep Clean",
      description: "Thorough cleaning of your entire home",
      price: "$200",
      features: [
        "All Basic Clean services",
        "Inside cabinet cleaning",
        "Window cleaning",
        "Baseboards and door frames",
      ],
    },
    {
      title: "Move In/Out",
      description: "Complete cleaning for moving",
      price: "$300",
      features: [
        "All Deep Clean services",
        "Appliance cleaning",
        "Wall washing",
        "Carpet deep cleaning",
      ],
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: "url('/lovable-uploads/974ff095-0122-4262-8a7c-b919b2beda9f.png')",
          backgroundPosition: "center 30%", // Adjusted to show more of the person
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          transform: `translateY(${scrollY * 0.1}px) translateY(-10%)`,
          height: '120vh',
          willChange: 'transform',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-purple-dark/70 to-purple-dark/90" />
      </div>

      <div className="relative">
        <Navigation />
        <Hero />
        
        <section id="services" className="relative py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
              Our Services
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </div>
          </div>
        </section>

        <WhyChooseUs />
      </div>
    </div>
  );
};

export default Index;