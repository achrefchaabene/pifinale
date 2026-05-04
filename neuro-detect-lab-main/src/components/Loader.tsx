import { Brain } from "lucide-react";
import { motion } from "framer-motion";

const Loader = ({ text = "Analyzing MRI scan..." }: { text?: string }) => (
  <div className="flex flex-col items-center gap-4 py-12">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-medical shadow-glow"
    >
      <Brain className="h-8 w-8 text-primary-foreground" />
    </motion.div>
    <p className="text-sm font-medium text-muted-foreground">{text}</p>
  </div>
);

export default Loader;
