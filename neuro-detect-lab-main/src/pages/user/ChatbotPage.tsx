import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import MedicalChatbotPanel from "@/components/MedicalChatbotPanel";

const ChatbotPage = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-foreground">
          <Bot className="h-8 w-8 text-primary" />
          Chatbot IA Medical
        </h1>
        <p className="text-muted-foreground">
          Assistant enrichi avec votre notebook et la base `alzheimer_data.json` pour les symptomes, soins quotidiens, communication, securite et prevention.
        </p>
      </motion.div>

      <MedicalChatbotPanel
        title="Conversation avec l'IA Medicale"
        subtitle="Reponses securisees sur Alzheimer en francais, darija et anglais"
      />
    </div>
  );
};

export default ChatbotPage;
