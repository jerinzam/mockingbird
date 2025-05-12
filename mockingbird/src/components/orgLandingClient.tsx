'use client';

import React, { useEffect, useState } from 'react';

type OrgSettings = {
  branding: {
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    orgName: string;
    tagline: string;
  };
  landing: {
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
    ctaLink: string;
  };
};

async function fetchOrgSettings(org: string): Promise<OrgSettings | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
    const res = await fetch(`${baseUrl}/api/organizations/by-slug/${org}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.org?.settings || null;
  } catch (err) {
    console.error('Error fetching org settings:', err);
    return null;
  }
}

export default function OrgLandingClient({ org }: { org: string }) {
  const [settings, setSettings] = useState<OrgSettings | null>(null);

  useEffect(() => {
    if (org) {
      fetchOrgSettings(org).then(setSettings);
    }
  }, [org]);

  if (!settings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 text-red-600 font-medium">
        Organization settings not found.
      </div>
    );
  }

  const { branding, landing } = settings;
  const themeColor = branding.primaryColor || '#4A90E2';
  const secondaryColor = branding.secondaryColor || '#2C3E50';
  const accentColor = branding.accentColor || '#F5F7FA';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${themeColor}05, ${accentColor})`,
      }}
    >
      <div className="w-full max-w-2xl px-6 text-center pt-24">
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center mb-12">
          {branding.logoUrl && (
            <img
              src={branding.logoUrl}
              alt={branding.orgName}
              className="h-20 w-20 rounded-full object-cover border-2 shadow-sm mb-4"
              style={{ 
                borderColor: themeColor,
                boxShadow: `0 4px 12px ${themeColor}08`
              }}
            />
          )}
          <p 
            className="text-lg font-medium"
            style={{ color: secondaryColor }}
          >
            {branding.tagline}
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <h1
            className="text-3xl font-bold"
            style={{ color: secondaryColor }}
          >
            {landing.title}
          </h1>

          <h2 
            className="text-lg font-medium"
            style={{ color: themeColor }}
          >
            {landing.subtitle}
          </h2>

          <p className="text-base text-gray-600 leading-relaxed max-w-xl mx-auto">
            {landing.description}
          </p>

          <div className="mt-8">
            <a
              href={landing.ctaLink || '/login'}
              className="inline-block px-10 py-2.5 text-white text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm"
              style={{ 
                backgroundColor: themeColor,
                boxShadow: `0 2px 8px ${themeColor}10`
              }}
            >
              {landing.ctaText}
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} {branding.orgName}
        </div>
      </div>
    </div>
  );
}