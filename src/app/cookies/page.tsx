import type { Metadata } from "next";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { LegalPage } from "@/components/legal-page";
import { cookiePolicy } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cookie Policy | ForgeHub Rwanda",
  description: cookiePolicy.lede,
};

export default function Cookies() {
  return (
    <LegalPage
      doc={cookiePolicy}
      extras={{ "your-choices": <CookieSettingsButton /> }}
    />
  );
}
