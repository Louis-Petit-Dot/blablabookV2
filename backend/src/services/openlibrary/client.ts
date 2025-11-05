import axios from "axios";
import { OPENLIBRARY_BASE_URL, type OpenLibraryError } from "./types.ts";

// Configuration axios pour OpenLibrary
export const openLibraryClient = axios.create({
    baseURL: OPENLIBRARY_BASE_URL,
    // Increase timeout to handle slow network responses in CI/local environments
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
        'User-Agent': 'BlaBlaBook/2.0 (Educational Project)',
    },
});


// Helper pour gerer les erreurs specifiques
export const handleOpenLibraryError = (error: unknown): OpenLibraryError => {
    if (error && typeof error === 'object' && 'error' in error) {
    return error as OpenLibraryError;
    }

    return {
    error: 'Unknown OpenLibrary error',
    details: String(error)
};
};