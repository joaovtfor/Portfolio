import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Sem incremental cache: todas as páginas são renderizadas por request (nonce da CSP).
export default defineCloudflareConfig();
