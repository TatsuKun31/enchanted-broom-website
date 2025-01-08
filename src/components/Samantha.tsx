import { motion } from "framer-motion";

interface SamanthaProps {
  message: string;
  position?: "left" | "right";
}

const Samantha = ({ message, position = "right" }: SamanthaProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-4 ${position === "right" ? "flex-row" : "flex-row-reverse"}`}
    >
      <div className={`relative max-w-sm ${position === "right" ? "mr-4" : "ml-4"}`}>
        <div className="bg-purple-secondary dark:bg-purple-dark/60 p-4 rounded-lg shadow-lg">
          <p className="text-purple-dark dark:text-white/90">{message}</p>
        </div>
        <div 
          className={`absolute bottom-0 ${position === "right" ? "-right-2" : "-left-2"} 
          transform ${position === "right" ? "translate-x-full" : "-translate-x-full"}`}
        >
          <div className="w-3 h-3 bg-purple-secondary dark:bg-purple-dark/60 rotate-45" />
        </div>
      </div>
      <img
        src="/samantha.svg"
        alt="Samantha the Witch"
        className="w-24 h-24 object-contain"
      />
    </motion.div>
  );
};

export default Samantha;