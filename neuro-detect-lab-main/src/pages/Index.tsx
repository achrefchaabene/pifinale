import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  FileText,
  Lock,
  MessageCircle,
  ScanSearch,
  Send,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Import rapide",
    desc: "Depose une IRM et lance l'analyse sans configuration complexe.",
  },
  {
    icon: BarChart3,
    title: "Rapports lisibles",
    desc: "Visualise les probabilites, comparaisons de modeles et resultats cliniques.",
  },
  {
    icon: ScanSearch,
    title: "Analyse multicouche",
    desc: "Les modeles IA comparent plusieurs stades pour renforcer l'aide au triage.",
  },
  {
    icon: Lock,
    title: "Acces protege",
    desc: "Les espaces patient et medecin restent separes et plus faciles a suivre.",
  },
];

const collaborationFeatures = [
  {
    icon: MessageCircle,
    title: "Message patient-medecin",
    desc: "Une messagerie simple pour poser une question, confirmer un symptome ou preparer une teleconsultation.",
  },
  {
    icon: Upload,
    title: "Partage du scan",
    desc: "Le patient peut transmettre l'IRM et le contexte clinique au bon medecin depuis la meme plateforme.",
  },
  {
    icon: FileText,
    title: "Envoi du rapport",
    desc: "Le rapport d'analyse peut etre partage rapidement pour faciliter la lecture, l'archivage et le suivi.",
  },
  {
    icon: Send,
    title: "Demande d'avis",
    desc: "Le medecin peut solliciter un second avis ou une relecture clinique a partir des resultats disponibles.",
  },
  {
    icon: Users,
    title: "Module Aidant/Famille",
    desc: "Un espace de coordination permet d'informer les proches, suivre les consignes et mieux organiser l'accompagnement.",
  },
];

const stats = [
  { value: "4", label: "stades analyses" },
  { value: "Multi", label: "modeles compares" },
  { value: "24/7", label: "plateforme disponible" },
  { value: "1", label: "espace centralise" },
];

export default function HomePage() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-y-auto overflow-x-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_42%,#f9fcff_100%)] text-slate-900">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(14,116,244,0.18),transparent_65%)]" />

      <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-slate-950">NeuroDetect Lab</p>
              <p className="text-xs text-slate-500">Plateforme d'analyse IRM Alzheimer</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-primary/30 hover:text-primary"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)] transition-transform hover:-translate-y-0.5"
            >
              Creer un compte
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <ShieldCheck className="h-4 w-4" />
                Analyse IA medicale plus claire et plus rapide
              </div>

              <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Une interface plus nette pour suivre les IRM et les rapports Alzheimer.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                NeuroDetect Lab centralise l'import patient, l'historique des analyses et les rapports medecins dans
                une experience plus lisible, scrollable et adaptee aux ecrans mobiles comme desktop.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(37,99,235,0.28)] transition-transform hover:-translate-y-0.5"
                >
                  Commencer maintenant
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-primary/30 hover:text-primary"
                >
                  Ouvrir la plateforme
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="relative"
            >
              <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
                <div className="rounded-[28px] bg-[linear-gradient(160deg,#0f172a_0%,#123b71_55%,#1d4ed8_100%)] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/70">Vue clinique</p>
                      <p className="mt-1 text-2xl font-bold">Rapports et historique</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3">
                      <Brain className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/60">Derniere analyse</p>
                      <p className="mt-2 text-lg font-semibold">Very Mild Demented</p>
                      <p className="mt-1 text-sm text-white/70">Comparaison multi-modele et vue detaillee par patient.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/10 p-4">
                        <p className="text-xs text-white/60">Patient</p>
                        <p className="mt-2 text-lg font-semibold">Espace scrollable</p>
                      </div>
                      <div className="rounded-2xl bg-cyan-300/15 p-4">
                        <p className="text-xs text-cyan-100/80">Medecin</p>
                        <p className="mt-2 text-lg font-semibold">Rapports plus lisibles</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-2xl font-bold text-slate-950">{stat.value}</p>
                      <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">Fonctions cle</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-slate-950 sm:text-4xl">
                Des pages longues qui restent fluides et faciles a parcourir.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * index }}
                    className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-950">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{feature.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-7xl rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">
                Teleconsultation / communication
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-slate-950 sm:text-4xl">
                Un parcours continu entre patient, medecin et proches.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                La plateforme ne s'arrete pas a l'analyse IRM: elle facilite aussi les echanges, le partage de scan,
                l'envoi du rapport et la coordination avec l'aidant ou la famille.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {collaborationFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * index }}
                    className="rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-950">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{feature.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/80 px-4 py-6 text-center text-sm text-slate-500 backdrop-blur sm:px-6 lg:px-8">
        NeuroDetect Lab 2026. Interface medicale pour patients et medecins.
      </footer>
    </div>
  );
}
