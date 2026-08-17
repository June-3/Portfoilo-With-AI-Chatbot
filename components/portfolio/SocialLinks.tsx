import { Github, Linkedin, Mail, Twitter, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Social } from "@/lib/content";

interface LinkItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  external: boolean;
}

export default function SocialLinks({
  social,
  className,
}: {
  social: Social;
  className?: string;
}) {
  const items: LinkItem[] = [
    { href: social.github ?? "", label: "GitHub", Icon: Github, external: true },
    { href: social.linkedin ?? "", label: "LinkedIn", Icon: Linkedin, external: true },
    { href: social.twitter ?? "", label: "Twitter", Icon: Twitter, external: true },
    { href: social.email ? `mailto:${social.email}` : "", label: "邮箱", Icon: Mail, external: false },
  ].filter((item): item is LinkItem => Boolean(item.href));

  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {items.map(({ href, label, Icon, external }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
}
