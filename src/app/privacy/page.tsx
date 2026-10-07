import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { privacyPolicy } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | ForgeHub Rwanda",
  description: privacyPolicy.lede,
};

export default function Privacy() {
  return <LegalPage doc={privacyPolicy} />;
}
