import Link from "next/link";

type ErrorPageProps = {
  code: "404" | "500" | "501" | "502" | "503";
  title: string;
  description: string;
  detail: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref: string;
  secondaryLabel: string;
  onRetry?: () => void;
  extra?: React.ReactNode;
};

function Prompt({ children }: { children: React.ReactNode }) {
  return <span className="error-prompt"><b>mikhailfur@lab</b><i>:</i><em>~</em><i>$</i> {children}</span>;
}

export function ErrorPage({ code, title, description, detail, primaryHref, primaryLabel, secondaryHref, secondaryLabel, onRetry, extra }: ErrorPageProps) {
  return (
    <main className="error-shell">
      <header className="error-topbar">
        <Link className="brand" href="/" aria-label="mikhail_fur home">
          <span className="brand-mark">&gt;_</span> mikhail_fur
        </Link>
        <span className="top-status"><b>●</b> error-handling / active</span>
      </header>

      <section className="error-wrap" aria-labelledby="error-title">
        <div className="terminal-frame error-frame">
          <div className="terminal-frame-bar">
            <span className="terminal-frame-controls" aria-hidden="true"><i /><i /><i /></span>
            <span className="terminal-frame-title">mikhail_fur // system-message</span>
            <span className="terminal-frame-actions">status: {code}</span>
          </div>
          <div className="terminal-frame-content error-content">
            <div className="error-command"><Prompt>diagnose --status {code}</Prompt></div>
            <div className="error-grid">
              <div className="error-code-block" aria-label={`HTTP status ${code}`}>
                <span className="error-code">{code}</span>
                <span className="error-code-rule" aria-hidden="true" />
                <span className="error-code-label">HTTP / RESPONSE</span>
              </div>
              <div className="error-copy">
                <p className="terminal-label"><span /> <span>system notice</span></p>
                <h1 id="error-title">{title}</h1>
                <p className="error-description">{description}</p>
                <div className="error-detail"><span>;</span> {detail}</div>
                <div className="error-actions">
                  {onRetry ? <button className="button button-primary" type="button" onClick={onRetry}>{primaryLabel} <span aria-hidden="true">-&gt;</span></button> : <Link className="button button-primary" href={primaryHref ?? "/"}>{primaryLabel} <span aria-hidden="true">-&gt;</span></Link>}
                  <Link className="button" href={secondaryHref}>{secondaryLabel}</Link>
                </div>
              </div>
            </div>
            <div className="error-log" aria-label="System log">
              <span><b>[status]</b> request resolved with {code}</span>
              <span><b>[hint]</b> keep calm, check the path, try again</span>
              <span><b>[ready]</b> waiting for next command<span className="error-cursor" aria-hidden="true" /></span>
            </div>
            {extra}
          </div>
        </div>
        <footer className="error-footer"><span><span className="brand-mark">&gt;_</span> mikhail_fur</span><span>Next.js · terminal blog</span></footer>
      </section>
    </main>
  );
}
