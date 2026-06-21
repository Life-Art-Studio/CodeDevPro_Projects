// AI Suggestion Service for Product Catalogue

import { getFallbackProducts } from "../utils/sectorConfig";

// Hardcoded OpenRouter API Key and Model as requested

const OPENROUTER_MODEL = "google/gemma-4-31b-it:free";

// Track last request time to enforce 5-second rate-limiting debounce
let lastRequestTime = 0;

export const AIService = {
  /**
   * Generates product suggestions for a given business sector using the built-in OpenRouter provider.
   * @param {string} sectorId
   * @param {string[]} subCategories
   * @returns {Promise<Array>} List of product suggestions
   */
  generateSuggestions: async (sectorId, subCategories = []) => {
    // 1. Debounce rate-limiting guard (max 1 call per 5 seconds)
    const now = Date.now();
    if (now - lastRequestTime < 5000) {
      const waitSeconds = Math.ceil((5000 - (now - lastRequestTime)) / 1000);
      throw new Error(`Rate limit: Please wait ${waitSeconds}s before requesting again.`);
    }
    
    // Update timestamp
    lastRequestTime = now;

    // 2. Local Cache Check
    const cacheKey = `ai_suggestions_cache_${sectorId}_openrouter`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        localStorage.removeItem(cacheKey); // clear corrupted cache
      }
    }

    const systemPrompt = `You are a product catalogue assistant. Given a business sector, return a JSON array of 20 to 30 commonly sold products. 
Each item MUST be an object with the exact fields:
{
  "name": "string (the name of the product or service)",
  "category": "string (MUST be one of the provided sub-categories)",
  "unit": "string (e.g. piece, kg, litre, hour, pack, box, service)",
  "estimatedPrice": number (in INR as a raw number, e.g. 150)",
  "tags": ["array", "of", "strings", "(2-3 relevant tags)"]
}
Return ONLY a valid JSON array. Do not return any introductory text, notes, markdown blocks, or explanation. Only return raw JSON.`;

    const userPrompt = `Sector: ${sectorId}. Sub-categories to choose from: ${subCategories.join(", ")}.`;

    let responseJson = null;

    try {
      const endpoint = "/.netlify/functions/openrouter-proxy";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `OpenRouter returned status ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data?.choices?.[0]?.message?.content;
      if (!textResponse) throw new Error("Received empty response from OpenRouter.");
      responseJson = cleanAndParseJSON(textResponse);

      // Convert generated suggestions into the full unified Catalogue Item schema
      if (Array.isArray(responseJson)) {
        const fullProducts = responseJson.map((item, idx) => {
          const id = `PROD-AI-${sectorId}-${Date.now()}-${idx}`;
          const formattedCat = item.category || subCategories[0] || "General";
          const sku = `AI-${sectorId.substring(0, 4).toUpperCase()}-${formattedCat.substring(0, 3).toUpperCase()}-${String(idx + 1).padStart(3, '0')}`;
          
          return {
            id,
            name: item.name,
            category: formattedCat,
            subCategory: formattedCat,
            sector: sectorId,
            unit: item.unit || "Piece",
            uom: item.unit || "Piece", // back-compat
            price: Number(item.estimatedPrice) || 100,
            mrp: Number(item.estimatedPrice) || 100, // back-compat
            sku,
            description: `AI suggested ${(item.name || 'product').toLowerCase()} for the ${sectorId} industry.`,
            tags: Array.isArray(item.tags) ? item.tags : ["AI Suggested"],
            source: "ai",
            retailerDivisor: 1.25,
            dbDivisor: 1.12,
            ssDivisor: 1.05,
            scheme: { buy: 0, free: 0 },
            inStock: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        });

        // 3. Cache successful response in localStorage
        try {
          localStorage.setItem(cacheKey, JSON.stringify(fullProducts));
        } catch (e) {
          // ignore quota errors
        }

        return fullProducts;
      } else {
        throw new Error("AI did not return a valid array of items.");
      }

    } catch (error) {
      console.error("AI service error:", error);
      throw error;
    }
  },

  /**
   * Auto-categorizes an array of products into valid subCategories using AI.
   * @param {Array} productsList 
   * @param {string} sectorId 
   * @param {string[]} subCategories 
   * @returns {Promise<Array>} Array of { id, suggestedCategory }
   */
  autoCategorizeProducts: async (productsList, sectorId, subCategories) => {
    const now = Date.now();
    if (now - lastRequestTime < 5000) {
      const waitSeconds = Math.ceil((5000 - (now - lastRequestTime)) / 1000);
      throw new Error(`Rate limit: Please wait ${waitSeconds}s before requesting again.`);
    }
    lastRequestTime = now;

    if (!productsList || productsList.length === 0) return [];

    const systemPrompt = `You are an AI catalogue categorization system. You will receive a JSON array of products and a list of valid sub-categories.
Your task is to assign the best matching sub-category to each product. 
You MUST return a valid JSON array of objects.
Each object MUST have exact fields:
{
  "id": "string (the exact product id provided)",
  "suggestedCategory": "string (MUST be one of the provided sub-categories. If none fit well, use the closest match or 'General')"
}
Return ONLY the raw JSON array. No markdown blocks or explanations.`;

    const simpleProductData = productsList.map(p => ({ id: p.id, name: p.name, currentCategory: p.category }));
    const userPrompt = `Sector: ${sectorId}. Valid Sub-categories: ${subCategories.join(", ")}.\nProducts to categorize:\n${JSON.stringify(simpleProductData)}`;

    try {
      const endpoint = "/.netlify/functions/openrouter-proxy";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("AI is currently overloaded or rate-limited. Please wait a moment and try again.");
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `OpenRouter returned status ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data?.choices?.[0]?.message?.content;
      if (!textResponse) throw new Error("Empty response from AI.");
      
      const parsed = cleanAndParseJSON(textResponse);
      if (!Array.isArray(parsed)) throw new Error("AI did not return a valid array.");
      
      return parsed;
    } catch (error) {
      console.error("AI Categorization Error:", error);
      throw error;
    }
  }
};

/**
 * Safely strips backticks or outer noise from AI response and parses JSON.
 * @param {string} rawText 
 * @returns {Array} parsed JSON array
 */
function cleanAndParseJSON(rawText) {
  let cleaned = rawText.trim();
  
  // Extract JSON from markdown codeblock fences if present
  const blockRegex = /```(?:json)?([\s\S]*?)```/i;
  const match = cleaned.match(blockRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  // Find the first '[' and last ']' to isolate the JSON array
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    cleaned = cleaned.substring(firstBracket, lastBracket + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON parsing failed for cleaned text: ", cleaned);
    throw new Error("Unable to parse AI response as valid JSON array. Please try again.");
  }
}
