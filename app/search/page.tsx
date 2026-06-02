import SearchResults from "@/components/SearchResults";

export const metadata = {
  title: "Search Jobs — Gulf-Rig",
  description: "Search oil & gas jobs across the Gulf region and worldwide.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <SearchResults q={(q || "").trim()} />;
}
