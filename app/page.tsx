import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { PublicProfile } from '../lib/types';

// Fetch data from the external Truth Engine dataset
// Fetch data from the external Truth Engine dataset
async function getProfile(): Promise<PublicProfile | null> {
    const handle = process.env.NEXT_PUBLIC_TRUTH_ENGINE_HANDLE;
    const apiBase = process.env.NEXT_PUBLIC_TRUTH_ENGINE_API_URL || 'https://ryanguidry.com';

    if (!handle) {
        console.error('Error: NEXT_PUBLIC_TRUTH_ENGINE_HANDLE environment variable is not set.');
        return null;
    }

    const url = `${apiBase}/api/u/${handle}/json`;

    try {
        const res = await fetch(url, { next: { revalidate: 60 } });
        if (!res.ok) {
            console.error(`Failed to fetch profile from ${url}: ${res.status} ${res.statusText}`);
            return null;
        }
        return res.json();
    } catch (e) {
        console.error('Error fetching profile:', e);
        return null;
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const profile = await getProfile();

    if (!profile) {
        return { title: 'Profile Not Found' };
    }

    return {
        title: `${profile.identity.name} | Portfolio`,
        description: profile.identity.headline || `${profile.identity.name}'s professional portfolio`,
    };
}

export default async function Page() {
    const profile = await getProfile();

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Profile Unavailable</h1>
                <p className="text-red-500 max-w-md">
                    Could not load profile data. Please ensure <code>NEXT_PUBLIC_TRUTH_ENGINE_HANDLE</code> is set correctly in your Vercel project settings.
                </p>
            </div>
        );
    }

    // Construct JSON-LD for Person entity
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": profile.identity.name,
        "jobTitle": profile.identity.headline,
        "description": profile.identity.summary,
        "url": profile.links?.website,
        "sameAs": profile.links?.sameAs,
        "address": profile.identity.location ? {
            "@type": "PostalAddress",
            "addressLocality": profile.identity.location.city,
            "addressRegion": profile.identity.location.region,
            "addressCountry": profile.identity.location.country
        } : undefined
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* JSON-LD for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <header className="mb-12">
                    <div className="flex items-start gap-6 mb-6">
                        {profile.identity.image && (
                            <img
                                src={profile.identity.image}
                                alt={profile.identity.name}
                                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                            />
                        )}
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                {profile.identity.name}
                            </h1>
                            {profile.identity.headline && (
                                <p className="text-xl text-gray-600 dark:text-gray-400 mt-1">
                                    {profile.identity.headline}
                                </p>
                            )}
                            {profile.identity.location && (
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                    📍 {[profile.identity.location.city, profile.identity.location.region, profile.identity.location.country].filter(Boolean).join(', ')}
                                </p>
                            )}
                        </div>
                    </div>

                    {profile.identity.summary && (
                        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                            {profile.identity.summary}
                        </p>
                    )}

                    {/* Links */}
                    {profile.links && (
                        <div className="flex flex-wrap gap-3 mt-4">
                            {profile.links.website && (
                                <a href={profile.links.website} target="_blank" rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                                    🌐 Website
                                </a>
                            )}
                            {profile.links.sameAs?.map((url) => (
                                <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                                    🔗 {new URL(url).hostname.replace('www.', '')}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Contact */}
                    {profile.contact?.publicEmail && (
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                            ✉️ <a href={`mailto:${profile.contact.publicEmail}`} className="hover:underline">
                                {profile.contact.publicEmail}
                            </a>
                        </p>
                    )}
                </header>

                {/* Experience */}
                {profile.experience && profile.experience.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
                            Experience
                        </h2>
                        <div className="space-y-6">
                            {profile.experience.map((exp, i) => (
                                <div key={i} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {exp.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {exp.organization}
                                                {exp.location && ` · ${exp.location}`}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-500 whitespace-nowrap mt-1 sm:mt-0">
                                            {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                                        </p>
                                    </div>

                                    {exp.highlights && exp.highlights.length > 0 && (
                                        <ul className="mt-3 space-y-1">
                                            {exp.highlights.map((h, j) => (
                                                <li key={j} className="text-gray-700 dark:text-gray-300 text-sm flex gap-2">
                                                    <span className="text-gray-400">•</span>
                                                    <span>{h}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {exp.tags && exp.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {exp.tags.map((tag) => (
                                                <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {profile.education && profile.education.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
                            Education
                        </h2>
                        <div className="space-y-4">
                            {profile.education.map((edu, i) => (
                                <div key={i} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {edu.institution}
                                    </h3>
                                    {(edu.degree || edu.program) && (
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {[edu.degree, edu.program].filter(Boolean).join(' — ')}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-500 dark:text-gray-500">
                                        {edu.startDate} — {edu.endDate || 'Present'}
                                        {edu.status && ` · ${edu.status}`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
                            Skills
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profile.skills.map((cat, i) => (
                                <div key={i} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                                        {cat.category}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {cat.items.map((skill) => (
                                            <span key={skill} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {profile.projects && profile.projects.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
                            Projects
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profile.projects.map((proj, i) => (
                                <div key={i} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {proj.url ? (
                                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">
                                                {proj.name} ↗
                                            </a>
                                        ) : proj.name}
                                    </h3>
                                    {proj.description && (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-3 leading-relaxed">
                                            {proj.description}
                                        </p>
                                    )}
                                    {proj.tech && proj.tech.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-4">
                                            {proj.tech.map((t) => (
                                                <span key={t} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs font-mono">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {proj.repoUrl && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer"
                                                className="text-xs font-medium text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                                View Source
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer with data links */}
                <footer className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-16 text-center text-sm text-gray-500 dark:text-gray-500">
                    <p className="mb-2">
                        Last updated {new Date(profile.lastUpdated || Date.now()).toLocaleDateString()}
                    </p>
                    <div className="flex justify-center gap-4 mb-4">
                        <a href={`${process.env.NEXT_PUBLIC_TRUTH_ENGINE_API_URL || 'https://ryanguidry.com'}/u/${profile.handle}.json`} className="hover:text-blue-600 transition tracking-tighter font-mono text-[10px]">📄 JSON</a>
                        <a href={`${process.env.NEXT_PUBLIC_TRUTH_ENGINE_API_URL || 'https://ryanguidry.com'}/u/${profile.handle}.jsonld`} className="hover:text-blue-600 transition tracking-tighter font-mono text-[10px]">🔗 JSON-LD</a>
                    </div>
                    <p className="mt-4 text-xs">
                        Powered by <a href="https://ryanguidry.com" className="text-blue-600 hover:underline font-semibold">Truth Engine</a>
                    </p>
                </footer>
            </div>
        </div>
    );
}
