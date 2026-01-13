
const REQUEST_TIMEOUT_MS = 3000;

const USER_AGENT = process.env.EXPO_PUBLIC_USER_AGENT || "";


const cleanHTMLTags = (text: string): string => {
  if (!text || typeof text !== "string") return text;

  let cleaned = "";
  let i = 0;

  while (i < text.length) {
    if (text[i].startsWith("<")) {
      
      const closeIndex = text.indexOf(">", i);
      if (closeIndex !== -1) {
        i = closeIndex + 1; 
        continue;
      }
    }
    cleaned += text[i];
    i++;
  }

  return cleaned.trim();
};

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs = REQUEST_TIMEOUT_MS
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

interface WikipediaSummaryResponse {
  title: string;
  displaytitle?: string;
  extract?: string;
  description?: string;
  thumbnail?: { source: string };
  content_urls?: { mobile?: { page: string } };
}

export interface WikipediaSummary {
  title: string;
  description?: string;
  extract?: string;
  url?: string;
  thumbnail?: string;
}

export async function fetchWikipediaSummary(
  title: string,
  lang: "pt" | "en" = "pt"
): Promise<WikipediaSummary | null> {
  try {
    const mappedTitle = title.trim().replace(/\s+/g, "_");
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      mappedTitle
    )}`;

    const response = await fetch(url, { method: "GET" });

    if (
      !response.ok ||
      !response.headers.get("content-type")?.includes("application/json")
    )
      return null;

    const data = (await response.json()) as WikipediaSummaryResponse;
    return {
      title: cleanHTMLTags(data.displaytitle ?? data.title),
      description: data.description,
      extract: data.extract,
      url: data.content_urls?.mobile?.page,
      thumbnail: data.thumbnail?.source,
    };
  } catch {
    return null;
  }
}

export async function searchCommonsImage(
  term: string | string[],
  targetWidth = 1200
): Promise<{ url: string; attribution?: string } | null> {
  const searchTerm = Array.isArray(term) ? term[0] : term;
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrlimit: "1",
    gsrsearch: searchTerm,
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: String(targetWidth),
    format: "json",
    origin: "*",
  });

  try {
    const response = await fetchWithTimeout(
      `https://commons.wikimedia.org/w/api.php?${params.toString()}`,
      {
        headers: { "User-Agent": USER_AGENT },
      }
    );

    if (
      !response.ok ||
      !response.headers.get("content-type")?.includes("application/json")
    )
      return null;

    const data = await response.json();
    const firstPage = Object.values(data?.query?.pages || {})[0] as any;
    const image = firstPage?.imageinfo?.[0];

    if (!image?.url) return null;

    return {
      url: image.thumburl ?? image.url,
      attribution: image.extmetadata?.Artist?.value || undefined,
    };
  } catch {
    return null;
  }
}

export async function PortugueseMeals() {
  try {
    const result = await fetch(
      "https://www.themealdb.com/api/json/v1/1/filter.php?a=Portuguese",
      { method: "GET" }
    );
    const data = await result.json();
    console.log(data);
    return data;
  } catch (error) {
    console.warn("Failed to fetch meals", error);
  }
}
export async function searchWikipediaGastronomia(searchTerm: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        searchTerm
      )}&srnamespace=0&srlimit=10&format=json`,
      {
        headers: {
          "User-Agent":
            "RemarAoTacho/1.0 (contact: info@remaraotacho.com; educational project)",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar na Wikipedia");
    }

    const data = await response.json();
    const results = data.query?.search || [];
    
    return results.map((item: any) => item.title);
  } catch (error) {
    console.log("Erro na busca:", error);
    return [];
  }
}

export async function fetchWikipediaTiti(title: string): Promise<any> {
  try {
    const response = await fetch(
      `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        title
      )}`,
      {
        headers: {
          "User-Agent":
            "RemarAoTacho/1.0 (contact: info@remaraotacho.com; educational project)",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Status:", response.status);
      throw new Error("Erro ao buscar dados da Wikipedia");
    }

    const data = await response.json();

    return {
      title: cleanHTMLTags(data.displaytitle ?? data.title),
      description: data.description,
      extract: data.extract,
      url: data.content_urls?.mobile?.page,
      thumbnail: data.thumbnail?.source,
    };
  } catch (error) {
    console.log(error);
  }
}