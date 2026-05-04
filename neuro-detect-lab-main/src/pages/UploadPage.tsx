import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ImageUpload from "@/components/ImageUpload";
import Loader from "@/components/Loader";
import { predictImage, type PredictionResponse } from "@/lib/api";

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const result: PredictionResponse = await predictImage(file);
      // Navigate to results, pass data via state
      navigate("/results", { state: { result } });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ?? "Failed to analyze image. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg text-center"
      >
        <h1 className="mb-2 font-display text-2xl font-bold text-foreground">
          Upload MRI Scan
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Upload a brain MRI image and our AI model will classify the stage of
          Alzheimer's disease.
        </p>

        {loading ? (
          <Loader />
        ) : (
          <ImageUpload
            onFileSelect={setFile}
            isLoading={loading}
            onAnalyze={handleAnalyze}
          />
        )}
      </motion.div>
    </div>
  );
};

export default UploadPage;
