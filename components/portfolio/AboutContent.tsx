"use client";

import { GraduationCap, Mail, MapPin } from "lucide-react";
import Avatar from "./Avatar";
import SocialLinks from "./SocialLinks";
import Timeline from "./Timeline";
import { useTranslations } from "@/lib/use-translations";
import { pickLocalized } from "@/lib/i18n";
import type { Profile, ExperienceItem, Social } from "@/lib/types";

export default function AboutContent({
  profile,
  experience,
  social,
}: {
  profile: Profile;
  experience: ExperienceItem[];
  social: Social;
}) {
  const { t, lang } = useTranslations();
  const education = experience.filter((e) => e.type === "education");

  const name = pickLocalized(lang, profile.name, profile.name_en);
  const title = pickLocalized(lang, profile.title, profile.title_en);
  const bio = pickLocalized(lang, profile.bio, profile.bio_en);
  const location = pickLocalized(lang, profile.location ?? "", profile.location_en);

  const firstSchool = education[0];
  const schoolName = firstSchool
    ? pickLocalized(lang, firstSchool.school ?? "", firstSchool.school_en)
    : "";
  const schoolDegree = firstSchool
    ? pickLocalized(lang, firstSchool.degree ?? "", firstSchool.degree_en)
    : "";

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 md:pt-16">
        {/* 页头 / header */}
        <div className="max-w-2xl">
          <span className="kicker">{t("about.subtitle")}</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("about.title")}
          </h1>
          <div className="divider-glow mt-4" />
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          {/* 介绍 / intro */}
          <div className="lg:col-span-7">
            <h2 className="text-xl font-bold text-foreground">
              {lang === "en" ? "Who Am I?" : "我是谁？"}
            </h2>
            <p className="mt-5 text-[1.05rem] leading-8 text-foreground/85">{bio}</p>

            {/* 社交链接 / socials */}
            <div className="mt-9">
              <p className="text-sm font-semibold text-foreground">
                {lang === "en" ? "Find me on" : "在以下平台找到我"}
              </p>
              <SocialLinks social={social} className="mt-3" />
            </div>
          </div>

          {/* 名片 / info card */}
          <div className="lg:col-span-5">
            <div className="panel p-7 text-center">
              <Avatar name={name} src={profile.avatar} size={140} />
              <h3 className="mt-5 text-xl font-extrabold text-foreground">{name}</h3>
              <p className="mt-1 text-sm text-[#4fc1ff]">{title}</p>

              <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-[#3794ff]/70 to-transparent" />

              <ul className="mt-5 space-y-3 text-left text-sm text-foreground/85">
                {location && (
                  <li className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 shrink-0 text-[#4fc1ff]" />
                    <span>{location}</span>
                  </li>
                )}
                {schoolName && (
                  <li className="flex items-center gap-2.5">
                    <GraduationCap className="h-4 w-4 shrink-0 text-[#4fc1ff]" />
                    <span>
                      {schoolName}
                      {schoolDegree ? ` · ${schoolDegree}` : ""}
                    </span>
                  </li>
                )}
                {profile.email && (
                  <li className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 shrink-0 text-[#4fc1ff]" />
                    <a
                      href={`mailto:${profile.email}`}
                      className="break-all transition-colors hover:text-[#4fc1ff] hover:underline"
                    >
                      {profile.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* 教育经历 / education timeline */}
        {education.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-foreground">{t("about.education")}</h2>
            <div className="mt-6 max-w-3xl">
              <Timeline items={education} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
