import OrgLandingClient from '@/components/orgLandingClient'; // client component

export default async function OrgLandingPage({ params }: {params: Promise<{ org: string }> }) {
  const { org } = await params;
  console.log('calllllling ORG LANDING PAGE1:',org);
  return <OrgLandingClient org={org} />;
}
