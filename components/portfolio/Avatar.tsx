"use client";

import { useState } from "react";

export default function Avatar({
  name,
  src,
  size = 160,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(src && src.trim() !== "" && !hasError);
  const initial = name?.trim().charAt(0).toUpperCase() || "?";

  if (showImage) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        onError={() => setHasError(true)}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-primary-foreground"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
      }}
    >
      {initial}
    </div>
  );
}
