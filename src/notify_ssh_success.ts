import { NtfyClient, type NtfyMessageOptions } from "./ntfy.ts";

async function main(): Promise<number> {
  const {
    PAM_TTY: pamTty,
    PAM_USER: pamUser,
    PAM_TYPE: pamType,
    NTFY_URL: rootUrl,
    NTFY_TOKEN: token,
  } = Deno.env.toObject();
  const ntfy = new NtfyClient({ rootUrl, token });
  const hostname = Deno.hostname();
  let emoji: "closed_lock_with_key" | "electric_plug";
  let priority: NtfyMessageOptions["priority"];
  let title: string;
  if (pamType === "open_session") {
    title = `SSH connect ${hostname}`;
    emoji = "closed_lock_with_key";
    priority = "urgent";
  } else if (pamType === "close_session") {
    title = `SSH disconnect ${hostname}`;
    emoji = "electric_plug";
    priority = "default";
  } else {
    console.error("Cannot get a valid PAM_TYPE='%s'", pamType);
    return 1;
  }
  const env = Object.entries(Deno.env.toObject())
    .filter(([name]) => !name.startsWith("NTFY"))
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${name}=${value}`)
    .join("\n");
  try {
    await ntfy.send({
      body: `\`${pamTty} ${pamUser}@${hostname}\`

\`\`\`
${env}
\`\`\`
`,
      topic: "ssh-alerts",
      tags: [
        emoji,
        "ssh",
        pamType,
        hostname,
      ],
      title,
      priority,
      markdown: true,
    });
  } catch (error) {
    console.error(error);
    return 2;
  }
  return 0;
}

if (import.meta.main) {
  Deno.exit(await main());
}
