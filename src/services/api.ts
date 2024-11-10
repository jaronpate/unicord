import type { Client } from "./client";

export class API {
    private readonly base_url: string = 'https://discord.com/api/v10';

    constructor(private client: Client) {}

    async request<T = any>(method: string, path: string, data?: any): Promise<T> {
        const url = `${this.base_url}${path}`;
        const headers = {
            Authorization: `Bot ${this.client.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        console.log(`API Request: ${method} ${url}`);

        const response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            console.error(`Failed to fetch: ${response.statusText} ${response.url} ${response.status}`);
            console.error(response.json());
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const body = await response.json();

        console.log('API Response:', JSON.stringify(body, null, 4));

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