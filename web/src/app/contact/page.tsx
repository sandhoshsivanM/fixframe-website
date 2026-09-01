import { ContactSection } from "@/components/ContactSection";

export const metadata = { title: "Contact", description: "Let's work together." };

export default function Contact() {
  // This section IS the page here, so its heading is the page title.
  return <ContactSection asPageTitle />;
}
