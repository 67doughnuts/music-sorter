// src/utils/sanitize.ts

// This function removes any potentially malicious characters from a string.
export function sanitize(input: string): string {
    return input.replace(/[^a-zA-Z0-9 ]/g, '');
}

