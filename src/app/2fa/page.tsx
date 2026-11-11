import type { Metadata } from "next";
import { TwoFactorNotebook } from "@/components/twofa/twofa-notebook";

export const metadata: Metadata = {
  title: "Блокнот 2FA",
  description: "Локальный TOTP-блокнот. Коды генерируются в браузере и никуда не отправляются.",
  robots: { index: false, follow: false },
};

export default function TwoFactorPage() {
  return <TwoFactorNotebook />;
}
