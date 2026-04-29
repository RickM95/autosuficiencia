/**
 * ✅ SAFE FETCH JSON WRAPPER
 * 
 * Prevents JSON parsing errors when server returns HTML fallback pages
 * Detects 404 / 500 / index.html fallbacks
 * Never attempts to parse HTML as JSON
 */

export async function safeFetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, options);

    const contentType = res.headers.get("content-type");
    const text = await res.text();

    // ✅ HARD GUARD: Prevent HTML parsing
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Non-JSON response detected:", url);
      console.error("Response preview:", text.slice(0, 250));
      
      throw new Error(`Invalid JSON response at ${url} - received HTML or non-JSON data`);
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("❌ JSON parse failed:", url);
      console.error("Parse error:", parseError.message);
      throw parseError;
    }

  } catch (error) {
    console.error("❌ Fetch failed:", url, error.message);
    throw error;
  }
}

export default safeFetchJSON