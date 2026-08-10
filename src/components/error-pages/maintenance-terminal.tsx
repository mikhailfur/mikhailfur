"use client";

import { useEffect, useState } from "react";
import type { GithubCommit } from "@/data/github-commits";

type Panel = "commits" | "protocol" | "recovery";

const panels: Array<{ id: Panel; label: string }> = [
  { id: "commits", label: "git log" },
  { id: "protocol", label: "protocol" },
  { id: "recovery", label: "recovery" },
];

const maintenanceMessages = [
  "site is under maintenance // signal is stable",
  "quiet mode enabled // upgrades in progress",
  "terminal is resting // returning shortly",
];

function formatDate(value: string) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(value));
}

export function MaintenanceTerminal({ commits, repositoryUrl }: { commits: GithubCommit[]; repositoryUrl: string }) {
  const [panel, setPanel] = useState<Panel>("commits");
  const [messageIndex, setMessageIndex] = useState(0);
  const [expandedSha, setExpandedSha] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "r" && !event.metaKey && !event.ctrlKey && !event.altKey) window.location.reload();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section className="maintenance-terminal" aria-label="Maintenance control terminal">
      <div className="maintenance-head">
        <div><span className="maintenance-pulse" /> MAINTENANCE_CHANNEL</div>
        <button type="button" onClick={() => setMessageIndex((index) => (index + 1) % maintenanceMessages.length)} aria-label="Change maintenance status message">cycle signal</button>
      </div>
      <button className="maintenance-signal" type="button" onClick={() => setMessageIndex((index) => (index + 1) % maintenanceMessages.length)}>
        <span className="maintenance-signal-mark">{"//"}</span>
        <span>{maintenanceMessages[messageIndex]}</span>
        <span className="maintenance-signal-arrow" aria-hidden="true">-&gt;</span>
      </button>
      <div className="maintenance-tabs" role="tablist" aria-label="Maintenance details">
        {panels.map((item) => (
          <button key={item.id} className={panel === item.id ? "is-active" : ""} type="button" role="tab" aria-selected={panel === item.id} onClick={() => setPanel(item.id)}>{item.label}</button>
        ))}
      </div>
      <div className="maintenance-body">
        {panel === "commits" && (
          <div className="commit-list" role="tabpanel">
            <div className="maintenance-command"><span>$</span> git log --oneline -{commits.length || 1} <a href={repositoryUrl} target="_blank" rel="noreferrer">[open repository]</a></div>
            {commits.length > 0 ? commits.map((commit) => (
              <div className={`commit-entry ${expandedSha === commit.sha ? "is-expanded" : ""}`} key={commit.sha}>
                <button type="button" onClick={() => setExpandedSha((current) => current === commit.sha ? null : commit.sha)} aria-expanded={expandedSha === commit.sha}>
                  <span className="commit-sha">{commit.sha}</span><span className="commit-message">{commit.message}</span><time dateTime={commit.date}>{formatDate(commit.date)}</time>
                </button>
                {expandedSha === commit.sha && <div className="commit-meta">author: {commit.author}<br /><a href={commit.url} target="_blank" rel="noreferrer">inspect commit -&gt;</a></div>}
              </div>
            )) : <p className="maintenance-empty">git remote is quiet or temporarily unreachable.</p>}
          </div>
        )}
        {panel === "protocol" && (
          <div className="maintenance-panel" role="tabpanel"><p><b>01</b> drain active requests</p><p><b>02</b> apply the next build</p><p><b>03</b> run smoke tests against production</p><p><b>04</b> reopen the front door</p></div>
        )}
        {panel === "recovery" && (
          <div className="maintenance-panel" role="tabpanel"><p><b>status</b> no action required from you</p><p><b>retry</b> in a few minutes</p><p><b>fallback</b> press <kbd>R</kbd> to reload this page</p></div>
        )}
      </div>
    </section>
  );
}
