"use client";

import { ArrowRight } from "lucide-react";
import SocialLinks from "./SocialLinks";
import Typewriter from "./Typewriter";
import { useTranslations } from "@/lib/use-translations";
import { pickLocalized } from "@/lib/i18n";
import type { Profile, Social } from "@/lib/types";

export default function Hero({ profile, social }: { profile: Profile; social: Social }) {
  const { t, lang } = useTranslations();

  const name = pickLocalized(lang, profile.name, profile.name_en);
  const title = pickLocalized(lang, profile.title, profile.title_en);
  const headline = pickLocalized(lang, profile.headline, profile.headline_en);
  const rawRoles = (lang === "en" ? profile.roles_en : profile.roles) ?? [];
  const roles = rawRoles.length > 0 ? rawRoles : [title];

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-8 pt-14 sm:px-6 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:pt-20">
        {/* 左侧文案 / Intro copy */}
        <div className="text-center lg:col-span-7 lg:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            {t("hero.greet")} <span className="wave">👋🏻</span>
          </h1>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
            {t("hero.iam")}{" "}
            <span className="text-grad glow-text">{name}</span>
          </h2>

          {/* 打字机角色标签 / rotating role labels */}
          <div className="mt-5 min-h-[2.2rem] text-center font-semibold text-[#4fc1ff] sm:text-lg md:min-h-[2.6rem] md:text-2xl lg:text-left">
            <Typewriter phrases={roles} />
          </div>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:mx-0">
            {headline}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <a
              href="#contact"
              className="btn-grad rounded-full px-6 py-2.5 text-sm font-semibold"
            >
              {t("hero.contact")}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-[#4fc1ff] hover:bg-accent hover:text-white"
            >
              {t("hero.viewProjects")}
            </a>
          </div>

          <SocialLinks social={social} className="mt-9 justify-center lg:justify-start" />
        </div>

        {/* 右侧宇航员插画 / Astronaut illustration */}
        <div className="relative hidden justify-center lg:col-span-5 lg:flex">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(55,148,255,0.28),transparent_65%)] blur-2xl"
          />
          <div className="hero-art relative w-[min(26rem,90%)]">
            <img
              src="/content/images/home-main.svg"
              alt="Developer at work"
              width={1000}
              height={1000}
              className="select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
