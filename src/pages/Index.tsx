import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import WhyChooseUs from "@/components/WhyChooseUs";
import { useEffect, useState } from "react";

const Index = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1721322800607-8c38375eef04')] bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          minHeight: '200vh',
          width: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      >
        <div className="absolute inset-0 bg-purple-dark/60" />
      </div>

      <Navigation />
      <Hero />
      
      <section id="services" className="relative py-20 bg-gradient-to-b from-purple-secondary/5 to-transparent dark:from-purple-dark/20 dark:to-transparent">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-purple-dark dark:text-purple-secondary mb-12">
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
  );
};

export default Index;
