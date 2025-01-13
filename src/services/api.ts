import { exists, log } from "../utils";
import type { Client } from "./client";

export class API {
    private readonly base_url: string = 'https://discord.com/api/v10';

    constructor(private client: Client) {}

    async request<T = any>(method: string, path: string, data?: any): Promise<T> {
        const url = `${this.base_url}${path.startsWith('/') ? '' : '/'}${path}`;
        const headers = {
            Authorization: `Bot ${this.client.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            // console.error(`Failed to fetch: ${response.statusText} ${response.url} ${response.status}`);
            console.log('Failed Request Response: ', await response.text());
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const body = await response.json();


        // console.log(`API Request: ${method} ${url}`);
        // console.log(`API Body: ${JSON.stringify(data, null, 4)}`);
        // console.log('API Response:', JSON.stringify(body, null, 4));

        // Extract rate limit headers
        const remaining = response.headers.get('X-RateLimit-Remaining');
        const limit = response.headers.get('X-RateLimit-Limit');
        const reset = response.headers.get('X-RateLimit-Reset');
        const resetSeconds = response.headers.get('X-RateLimit-Reset-After');
        const limitBucket = response.headers.get('X-RateLimit-Bucket');

        // Log rate limit info for debugging
        log(`Rate Limit: ${remaining}/${limit} - Reset: ${reset} (${resetSeconds}s) - Bucket: ${limitBucket}`);

        // If status is 429, we are being rate limited
        if (response.status === 429) {
            // Look for the retry-after header
            const retryAfter = response.headers.get('Retry-After');
            if (exists(retryAfter)) {
                // Wait for the retry-after time
                await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
            } else {
                // TODO: Handle this case better
                // Maybe wait some arbitrary time??
                throw new Error('Rate limited without Retry-After header');
            }
        }

        return body;
    }

    async get<T = any>(path: string): Promise<T> {
        return this.request('GET', path);
    }

    async post<T = any>(path: string, data: any): Promise<T> {
        return this.request('POST', path, data);
    }

    async patch<T = any>(path: string, data: any): Promise<T> {
        return this.request('PATCH', path, data);
    }

    async delete<T = any>(path: string): Promise<T> {
        return this.request('DELETE', path);
    }
}