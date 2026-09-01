import { Heading } from "@/components/Heading";
import { WorkArchive } from "@/components/WorkArchive";
import { getCategories, getProjects } from "@/lib/content";

export const metadata = {
  title: "Work",
  description: "College events, weddings and brand films — shot and cut by the same crew.",
};

// Fully static. Every project is rendered into the HTML and the category
// filter is applied from the URL on the client, so a filtered view stays
// shareable without the page needing a server.
export default async function Work() {
  const projects = await getProjects();
  const categories = await getCategories();

  return (
    <div className="section wrap">
      <Heading
        white="Our"
        red="Work"
        sub="Campus films, weddings and brand work — shot and cut by the same crew."
        size="lg"
        center={false}
      />
      <WorkArchive projects={projects} categories={categories} />
    </div>
  );
}
