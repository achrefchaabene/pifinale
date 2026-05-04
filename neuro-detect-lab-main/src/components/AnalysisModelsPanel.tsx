import { BrainCircuit, Cpu, Layers3, ScanSearch } from "lucide-react";

const ANALYSIS_MODELS = [
  {
    name: "BestModel",
    label: "Modele principal",
    description: "CNN principal ajoute a la comparaison multi-modele.",
  },
  {
    name: "EfficientNetB0",
    label: "Analyse legere",
    description: "Architecture compacte orientee rapidite et precision.",
  },
  {
    name: "EfficientNetB3",
    label: "Analyse fine",
    description: "Variante plus profonde pour des details plus subtils.",
  },
  {
    name: "AlzheimerCNN",
    label: "IRM specialisee",
    description: "Modele convolutionnel entraine specifiquement pour les IRM.",
  },
  {
    name: "EfficientNetB4",
    label: "Analyse detaillee",
    description: "Modele plus large pour comparer davantage de caracteristiques.",
  },
  {
    name: "UltraBestModel",
    label: "Comparaison finale",
    description: "Modele optimise pour renforcer la selection du meilleur score.",
  },
];

const AnalysisModelsPanel = () => {
  return (
    <section className="mx-auto mb-6 w-full max-w-5xl rounded-3xl border border-border/70 bg-card/95 p-5 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Cpu className="h-3.5 w-3.5" />
            Modeles d'analyse du scan
          </div>
          <h2 className="mt-3 font-display text-xl font-bold text-foreground">
            Cette IRM est comparee par 6 modeles IA avant le resultat final
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Chaque scan est traite en parallele, puis la plateforme retient automatiquement le modele
            ayant obtenu le meilleur score de confiance sur cette image.
          </p>
        </div>

        <div className="grid min-w-[240px] gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground sm:grid-cols-3 lg:w-[320px] lg:grid-cols-1">
          <div className="flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-primary" />
            <span>6 modeles compares</span>
          </div>
          <div className="flex items-center gap-2">
            <ScanSearch className="h-4 w-4 text-primary" />
            <span>Classement par confiance</span>
          </div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-primary" />
            <span>Resultat final automatique</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ANALYSIS_MODELS.map((model) => (
          <article
            key={model.name}
            className="rounded-2xl border border-border/70 bg-background/70 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">{model.name}</h3>
              <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                {model.label}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{model.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AnalysisModelsPanel;
