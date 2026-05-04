import type { PredictionResponse } from "@/lib/api";

export interface ScanRecord {
  id: string;
  date: string;
  prediction: string;
  probabilities: Record<string, number>;
  heatmap_url: string;
  explanation: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  scans: ScanRecord[];
  riskLevel: "Low" | "Medium" | "High";
}

export const mockScans: ScanRecord[] = [
  {
    id: "s1", date: "2026-03-28", prediction: "Non Demented",
    probabilities: { "Non Demented": 0.88, "Very Mild Demented": 0.07, "Mild Demented": 0.03, "Moderate Demented": 0.02 },
    heatmap_url: "", explanation: "No significant signs of cognitive decline detected.",
  },
  {
    id: "s2", date: "2026-03-15", prediction: "Very Mild Demented",
    probabilities: { "Non Demented": 0.15, "Very Mild Demented": 0.62, "Mild Demented": 0.18, "Moderate Demented": 0.05 },
    heatmap_url: "", explanation: "Subtle hippocampal volume reduction observed.",
  },
  {
    id: "s3", date: "2026-02-20", prediction: "Mild Demented",
    probabilities: { "Non Demented": 0.05, "Very Mild Demented": 0.12, "Mild Demented": 0.68, "Moderate Demented": 0.15 },
    heatmap_url: "", explanation: "Noticeable ventricular enlargement and cortical thinning detected.",
  },
];

export const mockPatients: PatientRecord[] = [
  { id: "p1", name: "Ahmed Hassan", email: "ahmed@mail.com", age: 72, gender: "Male", riskLevel: "Medium", scans: [mockScans[0], mockScans[1]] },
  { id: "p2", name: "Fatima Al-Rashid", email: "fatima@mail.com", age: 68, gender: "Female", riskLevel: "Low", scans: [mockScans[0]] },
  { id: "p3", name: "Mohammed Ali", email: "mohammed@mail.com", age: 75, gender: "Male", riskLevel: "High", scans: [mockScans[2], mockScans[1]] },
  { id: "p4", name: "Sara Ibrahim", email: "sara@mail.com", age: 65, gender: "Female", riskLevel: "Low", scans: [mockScans[0]] },
  { id: "p5", name: "Youssef Khalil", email: "youssef@mail.com", age: 80, gender: "Male", riskLevel: "High", scans: [mockScans[2]] },
];

// Simulated API prediction
export const mockPredict = async (): Promise<PredictionResponse> => {
  await new Promise((r) => setTimeout(r, 2000));
  const classes = ["Non Demented", "Very Mild Demented", "Mild Demented", "Moderate Demented"];
  const idx = Math.floor(Math.random() * classes.length);
  const probs: Record<string, number> = {};
  let remaining = 1;
  classes.forEach((c, i) => {
    if (i === idx) return;
    const v = +(Math.random() * remaining * 0.4).toFixed(2);
    probs[c] = v;
    remaining -= v;
  });
  probs[classes[idx]] = +remaining.toFixed(2);
  return {
    prediction: classes[idx],
    probabilities: probs,
    heatmap_url: "",
    explanation: "AI analysis complete. Region-specific findings noted.",
  };
};
