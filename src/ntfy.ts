export interface NtfyOptions {
  rootUrl: string;
  token: string;
}

export interface NtfyMessageOptions {
  topic: string;
  body: string;
  markdown?: boolean;
  title?: string;
  priority?:
    | 1
    | 2
    | 3
    | 4
    | 5
    | "max"
    | "urgent"
    | "high"
    | "default"
    | "low"
    | "min";
  tags?: string[];
}

export class NtfyClient {
  #rootUrl: URL;

  #headersInit: Headers;

  constructor({ rootUrl, token }: NtfyOptions) {
    this.#rootUrl = new URL(rootUrl);
    this.#headersInit = new Headers({
      "Authorization": `Bearer ${token}`,
    });
  }
  
  async send(
    { topic, body, markdown = false, priority, tags, title }:
      NtfyMessageOptions,
  ) {
    const headers = new Headers(this.#headersInit);
    if (title) {
      headers.set("X-Title", title);
    }
    if (priority) {
      headers.set("X-Priority", `${priority}`);
    }
    if (tags) {
      headers.set("X-Tags", tags.join(","));
    }
    if (markdown) {
      headers.set("Content-Type", "text/markdown");
    }
    const url = new URL(`/${topic}`, this.#rootUrl);
    const res = await fetch(url, {
      method: "PUT",
      headers,
      body,
    });
    if (!res.ok) {
      console.error(await res.text());
      throw new Error(`${res.status} ${res.statusText}`);
    }
  }
}
