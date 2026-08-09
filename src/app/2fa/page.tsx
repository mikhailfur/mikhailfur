import type { Metadata } from "next";
import { TwoFactorNotebook } from "@/components/twofa/two-factor-notebook";

export const metadata: Metadata = {
  title: "2FA TOTP | mikhail_fur",
  description: "A browser-local TOTP code generator and notebook.",
  robots: { index: false, follow: false },
};

export default function TwoFactorPage() {
  return <TwoFactorNotebook />;
}
