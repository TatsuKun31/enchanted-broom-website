import { motion } from "framer-motion";
import { Shield, Clock, Star } from "lucide-react";
import { Card } from "./ui/card";

const WhyChooseUs = () => {
  const features = [
    {
      icon: Shield,
      title: "Trusted & Insured",
      description: "All our cleaners are background checked and fully insured.",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Book a time that works best for you, 7 days a week.",
    },
    {
      icon: Star,
      title: "Quality Service",
      description: "100% satisfaction guaranteed or we'll re-clean for free.",
    },
  ];

  return (
    <section id="why-us" className="py-20 relative">
      <Card className="container mx-auto px-4 py-8 bg-white/90 dark:bg-purple-dark/90 backdrop-blur-sm">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-purple-dark dark:text-purple-secondary mb-12">
          Why Choose Us
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="inline-block p-4 bg-purple-secondary/30 dark:bg-purple-dark/50 rounded-full shadow-lg mb-6">
                <feature.icon className="w-8 h-8 text-purple-primary" />
              </div>
              <h3 className="text-xl font-bold text-purple-dark dark:text-purple-secondary mb-2">
                {feature.title}
              </h3>
              <p className="text-purple-dark/70 dark:text-purple-secondary/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </Card>
    </section>
  );
};

export default WhyChooseUs;