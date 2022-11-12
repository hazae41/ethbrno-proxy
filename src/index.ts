/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { createClient } from "@supabase/supabase-js";

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;

  SUPABASE_URL: string
  SUPABASE_KEY: string
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const ip = request.headers.get("CF-Connecting-IP")

    const { endpoint, jsonrpc, id, method, params } = await request.json() as any

    await createClient(env.SUPABASE_URL, env.SUPABASE_KEY)
      .from("requests")
      .insert({ ip, method, endpoint })

    const body = JSON.stringify({ jsonrpc, id, method, params })
    const headers = new Headers({ "Content-Type": "application/json" })
    const res = await fetch(endpoint, { method: "POST", body, headers })

    return new Response(res.body)
  },
};
