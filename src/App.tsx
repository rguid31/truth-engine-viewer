import { useEffect, useState } from 'react';

interface PublicProfile {
    handle: string;
    lastUpdated: string;
    identity: {
        name: string;
        headline?: string;
        summary?: string;
        image?: string;
        location?: { city?: string; region?: string; country?: string };
    };
    links?: { website?: string; sameAs?: string[] };
    contact?: { publicEmail?: string };
    experience?: any[];
    education?: any[];
    skills?: any[];
    projects?: any[];
}

export default function App() {
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Constants
    const handle = (import.meta as any).env.VITE_TRUTH_ENGINE_HANDLE;
    const apiBase = (import.meta as any).env.VITE_TRUTH_ENGINE_API_URL || 'https://ryanguidry.com';

    useEffect(() => {
        if (!handle) {
            setError('Setup Required: Please set VITE_TRUTH_ENGINE_HANDLE in Vercel.');
            setLoading(false);
            return;
        }

        fetch(`${apiBase}/api/u/${handle}/json`)
            .then(res => {
                if (!res.ok) throw new Error(`Status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setProfile(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Fetch error:', err);
                setError(`Failed to fetch profile: ${err.message}`);
                setLoading(false);
            });
    }, [handle, apiBase]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-sm font-medium opacity-50">Syncing with Truth Engine...</div>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-950 text-white text-center">
                <h1 className="text-2xl font-bold text-red-400 mb-4">Connection Failed</h1>
                <p className="max-w-md opacity-70 mb-8">{error}</p>
                <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-left text-sm font-mono w-full max-w-lg">
                    <p className="text-blue-400 mb-2">// How to fix:</p>
                    <p>1. Go to Vercel Settings &gt; Environment Variables</p>
                    <p>2. Add VITE_TRUTH_ENGINE_HANDLE = yourname</p>
                    <p>3. Redeploy your site</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white py-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_50%_120%,#6366f1,transparent)]"></div>
                <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
                    {profile.identity.image && (
                        <img
                            src={profile.identity.image}
                            alt={profile.identity.name}
                            className="w-36 h-36 rounded-full border-4 border-white/20 shadow-2xl mb-8 object-cover hover:scale-105 transition-transform"
                        />
                    )}
                    <h1 className="text-6xl font-black mb-3 tracking-tight">{profile.identity.name}</h1>
                    <p className="text-2xl text-indigo-200 font-light mb-8 max-w-2xl">{profile.identity.headline}</p>

                    <div className="flex flex-wrap justify-center gap-4">
                        {profile.contact?.publicEmail && (
                            <a href={`mailto:${profile.contact.publicEmail}`} className="px-8 py-3 bg-indigo-600 rounded-2xl hover:bg-indigo-500 transition font-bold shadow-lg shadow-indigo-600/20">Contact Me</a>
                        )}
                        {profile.links?.website && (
                            <a href={profile.links.website} target="_blank" className="px-8 py-3 bg-white/10 border border-white/10 rounded-2xl hover:bg-white/20 transition backdrop-blur-md font-bold">Main Portfolio</a>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20">
                {/* Core Profile Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 dark:border-slate-800 mb-16">
                    <h2 className="text-xs uppercase tracking-[0.2em] text-indigo-500 font-black mb-6">Mission / Summary</h2>
                    <p className="text-xl leading-relaxed text-slate-700 dark:text-slate-300 font-medium whitespace-pre-line">
                        {profile.identity.summary}
                    </p>
                </div>

                {/* Experience */}
                {profile.experience && profile.experience.length > 0 && (
                    <div className="mb-20">
                        <h2 className="text-4xl font-black mb-12 tracking-tight">Professional Journey</h2>
                        <div className="space-y-12">
                            {profile.experience.map((exp, i) => (
                                <div key={i} className="flex gap-8 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-5 h-5 rounded-full bg-indigo-500 group-hover:scale-125 transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                                        <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mt-2"></div>
                                    </div>
                                    <div className="pb-4 flex-1">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</p>
                                        <h3 className="text-2xl font-bold mb-1">{exp.title}</h3>
                                        <p className="text-indigo-500 font-bold text-lg mb-4">{exp.organization}</p>
                                        <ul className="space-y-3">
                                            {exp.highlights?.map((h: string, j: number) => (
                                                <li key={j} className="text-slate-600 dark:text-slate-400 flex gap-3 text-lg leading-relaxed">
                                                    <span className="text-indigo-400 font-black">›</span> <span>{h}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills Grid */}
                {profile.skills && profile.skills.length > 0 && (
                    <div className="mb-20">
                        <h2 className="text-4xl font-black mb-12 tracking-tight">Expertise</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profile.skills.map((cat, i) => (
                                <div key={i} className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl">
                                    <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-6">{cat.category}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {cat.items.map((skill: string) => (
                                            <span key={skill} className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm font-bold border border-slate-100 dark:border-slate-700/50 hover:border-indigo-500/50 transition-colors">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {profile.projects && profile.projects.length > 0 && (
                    <div>
                        <h2 className="text-4xl font-black mb-12 tracking-tight">Selected Work</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {profile.projects.map((proj, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 hover:-translate-y-2 transition-all group">
                                    <h3 className="text-2xl font-bold mb-3 group-hover:text-indigo-500 transition-colors">{proj.name}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 line-clamp-3">{proj.description}</p>
                                    <div className="flex justify-between items-center mt-auto">
                                        <div className="flex gap-2">
                                            {proj.tech?.slice(0, 3).map((t: string) => (
                                                <span key={t} className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg font-black uppercase tracking-tighter">{t}</span>
                                            ))}
                                        </div>
                                        {proj.url && (
                                            <a href={proj.url} target="_blank" className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full hover:bg-indigo-500 hover:text-white transition-all">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modern Footer */}
            <footer className="max-w-4xl mx-auto px-6 pt-32 pb-12 text-center">
                <div className="w-12 h-1 bg-indigo-500 mx-auto mb-12 rounded-full opacity-20"></div>
                <p className="text-slate-400 font-medium mb-8">Mirroring architecture from <span className="text-indigo-500 font-bold">ryanguidry.com</span> · Verified Dataset</p>
                <div className="inline-flex gap-4 p-3 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
                    <a href={`${apiBase}/u/${profile.handle}.json`} className="px-5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition text-[10px] font-black tracking-widest uppercase">📄 Data</a>
                    <a href={`${apiBase}/u/${profile.handle}.jsonld`} className="px-5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition text-[10px] font-black tracking-widest uppercase">🔗 Linked Data</a>
                </div>
                <p className="mt-12 text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase opacity-50">Powered by Truth Engine Platform</p>
            </footer>
        </div>
    );
}
