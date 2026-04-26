import { redirect } from "next/navigation";
import { getSessionForSlug } from "@/lib/session";
import HubOverlay from "@/components/HubOverlay";

export const dynamic = "force-dynamic";

export default function HubPage({ params }: { params: { slug: string } }) {
  const session = getSessionForSlug(params.slug);
  if (!session) redirect("/");

  return (
    <HubOverlay
      familyName={session.family_name}
      familySlug={session.family_slug}
    />
  );
}
