"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight typewriter that cycles through a list of phrases.
 * 打字机组件：循环打字/删除给定的角色标签列表。
 */
export default function Typewriter({ phrases }: { phrases: string[] }) {
  const phrasesRef = useRef<string[]>(phrases);
  phrasesRef.current = phrases;

  const [text, setText] = useState("");

  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer: number | undefined;

    const tick = () => {
      const list = phrasesRef.current;
      if (list.length === 0) return;
      const current = list[phraseIndex % list.length] ?? "";

      if (!deleting && charIndex < current.length) {
        charIndex += 1;
        setText(current.slice(0, charIndex));
        timer = window.setTimeout(tick, 85);
      } else if (!deleting && charIndex === current.length) {
        // 停顿片刻再删除 / Hold before deleting.
        deleting = true;
        timer = window.setTimeout(tick, 1700);
      } else if (deleting && charIndex > 0) {
        charIndex -= 1;
        setText(current.slice(0, charIndex));
        timer = window.setTimeout(tick, 38);
      } else {
        deleting = false;
        phraseIndex += 1;
        timer = window.setTimeout(tick, 320);
      }
    };

    timer = window.setTimeout(tick, 250);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <span className="whitespace-pre-wrap">
      {text}
      <span className="type-caret" aria-hidden="true">
        |
      </span>
    </span>
  );
}
