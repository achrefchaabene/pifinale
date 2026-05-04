import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getPatients } from "@/lib/api";
import { Loader2 } from "lucide-react";

const PerformanceData = [
  { metric: "Accuracy", value: 95.2 },
  { metric: "Precision", value: 94.8 },
  { metric: "Recall", value: 93.5 },
  { metric: "F1-Score", value: 94.1 },
];

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="rounded-2xl border border-border bg-card p-5 shadow-card"
  >
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
  </motion.div>
);

const DashboardPage = () => {
  const { user } = useAuth();

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients-dashboard"],
    queryFn: () => getPatients(user?.token || ""),
    enabled: !!user?.token,
  });

  // Calculate class distribution from patients
  const classDistribution = (() => {
    const distribution: Record<string, number> = {
      "Non Demented": 0,
      "Very Mild": 0,
      "Mild": 0,
      "Moderate": 0,
    };

    patients.forEach((p: any) => {
      const diagnosis = p.prediction?.toLowerCase() || "non demented";
      if (diagnosis.includes("mild")) {
        if (diagnosis.includes("very")) distribution["Very Mild"]++;
        else distribution["Mild"]++;
      } else if (diagnosis.includes("moderate")) {
        distribution["Moderate"]++;
      } else {
        distribution["Non Demented"]++;
      }
    });

    return [
      { name: "Non Demented", value: distribution["Non Demented"] || 1, color: "hsl(142,71%,45%)" },
      { name: "Very Mild", value: distribution["Very Mild"] || 1, color: "hsl(48,96%,53%)" },
      { name: "Mild", value: distribution["Mild"] || 1, color: "hsl(25,95%,53%)" },
      { name: "Moderate", value: distribution["Moderate"] || 1, color: "hsl(0,72%,51%)" },
    ];
  })();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
    <h1 className="mb-2 font-display text-2xl font-bold text-foreground">
      Model Dashboard
    </h1>
    <p className="mb-8 text-sm text-muted-foreground">
      Training metrics and dataset statistics for the Alzheimer detection model.
    </p>

    {/* Stats */}
    <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Scans" value={String(patients.length)} />
      <StatCard label="Overall Accuracy" value="95.2%" />
      <StatCard label="F1-Score" value="94.1%" />
      <StatCard label="Classes" value="4" />
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      {/* Pie */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Class Distribution
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={classDistribution}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={55}
              strokeWidth={2}
            >
              {classDistribution.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid hsl(214,20%,90%)",
                fontSize: "0.75rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          {classDistribution.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
              {d.name}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Model Performance
        </h3>
        <ResponsiveContainer width="100%" height={280}>i
          <BarChart data={PerformanceData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
            <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <YAxis domain={[85, 100]} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid hsl(214,20%,90%)",
                fontSize: "0.75rem",
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="hsl(212,72%,48%)" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
    </div>
  );
};

export default DashboardPage;
