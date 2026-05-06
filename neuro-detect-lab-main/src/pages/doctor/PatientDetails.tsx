import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getPatient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PatientRecord {
  _id: string;
  name: string;
  age: number;
  symptoms: string[];
  prediction: string;
  createdAt: string;
}

const severityColor: Record<string, string> = {
  "Non Demented": "bg-severity-healthy",
  "Very Mild Demented": "bg-severity-mild",
  "Mild Demented": "bg-severity-moderate",
  "Moderate Demented": "bg-severity-severe",
};

const PatientDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: patient, isLoading, error } = useQuery({
    queryKey: ["patient", id, user?.token],
    queryFn: () => getPatient(id!, user?.token || ""),
    enabled: !!id && !!user?.token,
  });

  if (error) {
    toast.error("Failed to load patient details");
  }

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Patient not found.</p>
        <Button asChild variant="outline" className="rounded-xl mt-4">
          <Link to="/doctor/patients"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-xl">
          <Link to="/doctor/patients"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{patient.name}</h1>
          <p className="text-sm text-muted-foreground">Patient profile and scan history</p>
        </div>
      </div>

      {/* Info card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-5 shadow-card max-w-lg">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Age:</span>
            <span className="font-medium text-foreground">{patient.age}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Symptoms:</span>
            <span className="font-medium text-foreground">
              {patient.symptoms?.length > 0 ? patient.symptoms.join(", ") : "None reported"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Last Prediction:</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              patient.prediction === "Non Demented" ? "bg-severity-healthy/10 text-severity-healthy" :
              patient.prediction === "Very Mild Demented" ? "bg-severity-mild/10 text-severity-mild" :
              patient.prediction === "Mild Demented" ? "bg-severity-moderate/10 text-severity-moderate" :
              "bg-severity-severe/10 text-severity-severe"
            }`}>{patient.prediction}</span>
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-4">Scan Timeline</h2>
        <div className="relative border-l-2 border-border pl-6 space-y-6">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="relative">
            <div className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-card ${severityColor[patient.prediction] ?? "bg-muted"}`} />
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Calendar className="h-3 w-3" /> {new Date(patient.createdAt).toLocaleDateString()}
              </div>
              <p className="text-sm font-medium text-foreground">{patient.prediction}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Latest scan result for this patient. Regular monitoring recommended.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
