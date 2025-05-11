// src/app/[org]/page.tsx
export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';

async function getOrgData(org: string) {
  // Fetch org data from your API or database
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/organizations/by-slug/${org}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.org;
}

export default async function OrgHomePage({ params }: { params: { org: string } }) {
    console.log('ORG PAGE RENDERED:', params.org);
    const org = await getOrgData(params.org);

  if (!org) {
    notFound();
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl text-center">
        <img src={org.logo_url} alt={org.name} className="mx-auto mb-4 h-20" />
        <h1 className="text-3xl font-bold mb-2">{org.slug}</h1>
        <p className="text-gray-600 mb-4">{org.description}</p>
        {/* Add more org-specific content here */}
      </div>
    </main>
  );
}