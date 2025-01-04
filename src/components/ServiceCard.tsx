import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ServiceCardProps {
  title: string;
  description: string;
  price: string;
  features: string[];
}

const ServiceCard = ({ title, description, price, features }: ServiceCardProps) => {
  const navigate = useNavigate();

  const handleSelectPlan = () => {
    navigate("/auth");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-purple-secondary/10 dark:bg-purple-dark/40 p-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-purple-primary/20 transition-all duration-300 border border-purple-secondary/20 hover:border-purple-primary/30"
    >
      <h3 className="text-2xl font-bold text-purple-primary mb-2 hover:text-purple-primary/80 transition-colors">{title}</h3>
      <p className="text-purple-dark/70 dark:text-purple-secondary/70 mb-4">{description}</p>
      <p className="text-3xl font-bold text-purple-primary mb-6">{price}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-purple-dark dark:text-purple-secondary/90">
            <svg
              className="w-5 h-5 text-purple-primary mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <motion.button 
        onClick={handleSelectPlan}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 bg-purple-primary hover:bg-purple-primary/90 focus:ring-4 focus:ring-purple-secondary/50 text-white py-2 rounded-lg transition-all duration-300"
      >
        Select Plan
      </motion.button>
    </motion.div>
  );
};

export default ServiceCard;