import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '69a2731e00047b3b01e9';

if (!import.meta.env.VITE_APPWRITE_PROJECT_ID) {
    console.warn('Appwrite Project ID is missing from environment variables. Using default fallback.');
}

client
    .setEndpoint(endpoint)
    .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Constants
export const DATABASE_ID = 'staysetu_db';
export const BUCKET_ID = 'listing-images';

export const COLLECTION = {
    profiles: 'profiles',
    listings: 'listings',
    favorites: 'favorites',
    roommateRequests: 'roommate_requests',
    messages: 'messages',
};

// Helper: Get image URL from Appwrite storage
export const getImageUrl = (fileId) => {
    const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
    const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '69a2731e00047b3b01e9';
    return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${projectId}`;
};

// Helper: Parse images or amenities from JSON string or array
export const parseJsonField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field !== 'string') return [];
    try {
        return JSON.parse(field);
    } catch (e) {
        console.error('JSON Parse Error for field:', field, e);
        return [];
    }
};

// Re-export for convenience
export { ID, Query, client };
