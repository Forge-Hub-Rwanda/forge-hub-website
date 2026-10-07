import type { Metadata } from "next";
import { AccountScreen } from "@/components/account-screen";
import { accountPage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Account | ForgeHub Rwanda",
  description: accountPage.lede,
  // An admin door, not a page anyone should land on from a search.
  robots: { index: false, follow: false },
};

/**
 * No header, hero or footer: the page is the full-screen menu with the forms
 * in it — see `AccountScreen`.
 */
export default function Login() {
  return (
    <>
      <AccountScreen />
      {/* The screen opens from script. Without it, show it already open. */}
      <noscript>
        <style>{`#account-screen .menu-veil,#account-screen .menu-panel{clip-path:none!important}#account-screen .menu-line,#account-screen .menu-rise,#account-screen .menu-fade{transform:none!important;opacity:1!important}`}</style>
      </noscript>
    </>
  );
}
