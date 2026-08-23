import { AdminShell } from "./AdminShell";
export const metadata = { title: "Studio — Fix Frame", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
