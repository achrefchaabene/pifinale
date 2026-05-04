import { useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PredictionResult from "@/components/PredictionResult";
import type { PredictionResponse } from "@/lib/api";

const ResultsPage = () => {
  const location = useLocation();
  const result = (location.state as { result?: PredictionResponse })?.result;

  if (!result) {
    return (
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-24 text-center">
        <p className="text-muted-foreground">No results to display.</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/upload">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Upload
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Analysis Results
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the AI prediction and Grad-CAM visualization below.
        </p>
      </div>

      <PredictionResult data={result} />

      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/upload">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Analyze Another Scan
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ResultsPage;
