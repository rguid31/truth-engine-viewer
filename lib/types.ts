export interface PublicProfile {
    schemaVersion: string;
    handle: string;
    versionId: string;
    lastUpdated: string;
    contentHash: string;
    identity: {
        name: string;
        headline?: string;
        summary?: string;
        image?: string;
        location?: {
            city?: string;
            region?: string;
            country?: string;
        };
    };
    links?: {
        website?: string;
        sameAs?: string[];
    };
    contact?: {
        publicEmail?: string;
        phone?: string;
    };
    experience?: Array<{
        organization: string;
        title: string;
        location?: string;
        startDate?: string;
        endDate?: string;
        isCurrent?: boolean;
        highlights?: string[];
        tags?: string[];
    }>;
    education?: Array<{
        institution: string;
        program?: string;
        degree?: string;
        startDate?: string;
        endDate?: string;
        status?: 'completed' | 'in-progress' | 'incomplete' | 'withdrawn';
    }>;
    skills?: Array<{
        category: string;
        items: string[];
    }>;
    projects?: Array<{
        name: string;
        description?: string;
        tech?: string[];
        url?: string;
        repoUrl?: string;
    }>;
}
