"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Users,
  Dumbbell,
  Heart,
  CreditCard,
  BarChart3,
  Play,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <motion.div {...fadeUp}>
          <Badge variant="secondary" className="mb-6">
            🚀 Now in Beta — 14-day free trial
          </Badge>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto mb-6"
          {...fadeUp}
          transition={{ delay: 0.1 }}
        >
          {t("title")}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          {...fadeUp}
          transition={{ delay: 0.2 }}
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          {...fadeUp}
          transition={{ delay: 0.3 }}
        >
          <Button size="xl" asChild>
            <Link href="/register">
              {t("cta")}
              <ArrowRight className="ms-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="xl" variant="outline">
            <Play className="me-2 h-4 w-4" />
            {t("ctaSecondary")}
          </Button>
        </motion.div>

        <motion.div
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          {...fadeUp}
          transition={{ delay: 0.4 }}
        >
          {[
            { value: "2,000+", label: "Coaches" },
            { value: "50K+", label: "Clients" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const t = useTranslations("landing.features");

  const features = [
    { key: "website", icon: Globe, color: "text-blue-500" },
    { key: "clients", icon: Users, color: "text-green-500" },
    { key: "programs", icon: Dumbbell, color: "text-orange-500" },
    { key: "recovery", icon: Heart, color: "text-red-500" },
    { key: "payments", icon: CreditCard, color: "text-purple-500" },
    { key: "analytics", icon: BarChart3, color: "text-cyan-500" },
  ] as const;

  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-xl border bg-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-4 group-hover:scale-110 transition-transform ${feature.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {t(`${feature.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`${feature.key}.description`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  const t = useTranslations("landing.cta");

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-primary px-8 py-16 md:px-16 md:py-20 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary opacity-90" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {t("title")}
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-8">
              {t("subtitle")}
            </p>
            <Button
              size="xl"
              variant="secondary"
              className="shadow-lg"
              asChild
            >
              <Link href="/register">
                {t("button")}
                <ArrowRight className="ms-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
