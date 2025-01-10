import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

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

  const isDeepCleaning = title.toLowerCase().includes("deep");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${
        isDeepCleaning ? 'bg-purple-primary/10' : 'bg-purple-secondary/10'
      } dark:bg-purple-dark/40 p-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-purple-primary/20 transition-all duration-300 border border-purple-secondary/20 hover:border-purple-primary/30`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className={`text-2xl font-bold ${
          isDeepCleaning ? 'text-purple-primary' : 'text-purple-dark'
        } mb-2 hover:text-purple-primary/80 transition-colors`}>
          {title}
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-purple-primary/70 hover:text-purple-primary transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                {isDeepCleaning 
                  ? "Our deep cleaning service includes thorough cleaning of all surfaces, including hard-to-reach areas and detailed attention to fixtures and appliances."
                  : "Standard cleaning covers all essential cleaning tasks to maintain a tidy and fresh living space."}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-purple-dark/70 dark:text-purple-secondary/70 mb-4">{description}</p>
      <p className={`text-3xl font-bold ${
        isDeepCleaning ? 'text-purple-primary' : 'text-purple-dark'
      } mb-6`}>{price}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <motion.li 
            key={index} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center text-purple-dark dark:text-purple-secondary/90"
          >
            <svg
              className={`w-5 h-5 ${
                isDeepCleaning ? 'text-purple-primary' : 'text-purple-dark/70'
              } mr-2`}
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
          </motion.li>
        ))}
      </ul>
      <motion.button 
        onClick={handleSelectPlan}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full mt-6 ${
          isDeepCleaning 
            ? 'bg-purple-primary hover:bg-purple-primary/90' 
            : 'bg-purple-dark hover:bg-purple-dark/90'
        } focus:ring-4 focus:ring-purple-secondary/50 text-white py-3 rounded-lg transition-all duration-300`}
      >
        Select Plan
      </motion.button>
    </motion.div>
  );
};

export default ServiceCard;