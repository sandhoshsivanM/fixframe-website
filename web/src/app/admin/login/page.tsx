import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

// The CRM is parked until after the public site is live, so on a deployment
// with no API configured this route does not exist at all — rather than
// advertising a sign-in that cannot work and inviting people to try it.
//
// Run the API (or set NEXT_PUBLIC_API) and it comes back.
const enabled = Boolean(process.env.NEXT_PUBLIC_API) || process.env.NODE_ENV === "development";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Login() {
  if (!enabled) notFound();
  return <LoginForm />;
}
