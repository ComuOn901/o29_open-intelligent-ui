"use client";

import "./gallery.css";

import { Renderer, type ActionEvent, type OpenUIError } from "@openuidev/react-lang";
import { useCallback, useState } from "react";
import { library } from "@/lib/library";
import { webUrl } from "@/lib/components/style";
import { programs, type Program } from "./programs";

function Example({ program, onAction }: { program: Program; onAction: (event: ActionEvent) => void }) {
  const [errors, setErrors] = useState<OpenUIError[]>([]);
  const onError = useCallback((list: OpenUIError[]) => {
    setErrors(list);
    if (list.length) console.error(`[gallery:${program.id}]`, list.map((e) => e.message).join("; "));
  }, [program.id]);
  return (
    <section className="gallery-example" id={program.id} aria-labelledby={`${program.id}-title`}>
      <header>
        <h2 id={`${program.id}-title`}>{program.title}</h2>
        <p>{program.note}</p>
      </header>
      <div className="gallery-preview">
        <Renderer response={program.code} library={library} isStreaming={false} onAction={onAction} onError={onError} />
      </div>
      {errors.length > 0 && (
        <ul className="gallery-errors">
          {errors.map((e, i) => <li key={i}>{e.message}</li>)}
        </ul>
      )}
      <details className="gallery-source">
        <summary>OpenUI Lang</summary>
        <pre>{program.code}</pre>
      </details>
    </section>
  );
}

export function Gallery({ theme }: { theme: "light" | "dark" }) {
  const [notice, setNotice] = useState("");
  const onAction = useCallback((event: ActionEvent) => {
    if (event.type === "open_url") {
      const url = webUrl((event.params as { url?: unknown })?.url);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    const context = (event.params as { context?: unknown })?.context;
    setNotice(`Sent to the assistant: “${event.humanFriendlyMessage}”${context ? ` with ${JSON.stringify(context)}` : ""}`);
  }, []);

  return (
    <div className="gallery" data-theme={theme}>
      <header className="gallery-top">
        <div>
          <span className="gallery-name">OpenUI</span>
          <span className="gallery-divider" />
          <span className="gallery-sub">Component gallery</span>
        </div>
        <nav className="gallery-theme" aria-label="Theme">
          <a href="?theme=light" aria-current={theme === "light" ? "page" : undefined}>Light</a>
          <a href="?theme=dark" aria-current={theme === "dark" ? "page" : undefined}>Dark</a>
        </nav>
      </header>
      <main className="gallery-content">
        <div className="gallery-intro">
          <h1>Primitives, composed by the model</h1>
          <p>Hand-written OpenUI Lang 1.0 programs rendered by the 1.0 Renderer with this app&apos;s library. {library.components ? Object.keys(library.components).length : 0} components.</p>
          <nav className="gallery-index" aria-label="Examples">
            {programs.map((p) => <a key={p.id} href={`#${p.id}`}>{p.title}</a>)}
          </nav>
        </div>
        {programs.map((program) => <Example key={program.id} program={program} onAction={onAction} />)}
      </main>
      {notice && (
        <div className="gallery-notice" role="status">
          <span>{notice}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setNotice("")}>×</button>
        </div>
      )}
    </div>
  );
}
