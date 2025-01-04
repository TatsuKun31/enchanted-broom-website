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
      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
    >
      <h3 className="text-2xl font-bold text-purple-primary mb-2">{title}</h3>
      <p className="text-purple-dark/70 mb-4">{description}</p>
      <p className="text-3xl font-bold text-purple-primary mb-6">{price}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-purple-dark">
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
      <button 
        onClick={handleSelectPlan}
        className="w-full mt-6 bg-purple-primary hover:bg-purple-primary/90 text-white py-2 rounded-lg transition-colors"
      >
        Select Plan
      </button>
    </motion.div>
  );
};

export default ServiceCard;