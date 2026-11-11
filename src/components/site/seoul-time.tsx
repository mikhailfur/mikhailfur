"use client";

import { useEffect, useState } from "react";

export function SeoulTime({ compact = false }: { compact?: boolean }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("ru-RU", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      minute: "2-digit",
    });
    const update = () => setTime(formatter.format(new Date()));
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span suppressHydrationWarning>
      {compact ? time : time ? `${time} ICT` : "—"}
    </span>
  );
}
