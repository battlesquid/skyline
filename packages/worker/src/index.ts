/**
 * Adapted from:
 * https://github.com/gr2m/cloudflare-worker-github-oauth-login
 */

import { ExportedHandler, Response } from "@cloudflare/workers-types"

interface Env {
    CLIENT_ID: string;
    CLIENT_SECRET: string
}

export default {
    async fetch(request, env) {
        // handle CORS pre-flight request
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }

        // redirect GET requests to the OAuth login page on github.com
        if (request.method === "GET") {
            return Response.redirect(
                `https://github.com/login/oauth/authorize?client_id=${env.CLIENT_ID}`,
                302
            );
        }

        try {
            const { code } = await request.json<{ code: string }>();

            const response = await fetch(
                "https://github.com/login/oauth/access_token",
                {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        "user-agent": "cloudflare-worker-github-oauth-login",
                        accept: "application/json",
                    },
                    body: JSON.stringify({
                        client_id: env.CLIENT_ID,
                        client_secret: env.CLIENT_SECRET,
                        code
                    }),
                }
            );
            const result = await response.json();
            const headers = {
                "Access-Control-Allow-Origin": "*",
            };

            if (result.error) {
                return new Response(JSON.stringify(result), { status: 401, headers });
            }

            return new Response(JSON.stringify({ token: result.access_token }), {
                status: 201,
                headers,
            });
        } catch (error) {
            console.error(error);
            return new Response(error.message, {
                status: 500,
            });
        }
    }
} satisfies ExportedHandler<Env>;
