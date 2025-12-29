import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- TOOL DEFINITIONS ---

const appTools: FunctionDeclaration[] = [
  {
    name: 'add_market_listing',
    description: 'List a crop for sale in the marketplace. Use this when the user wants to sell a crop.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        crop: { type: Type.STRING, description: 'Name of the crop (e.g., Wheat, Onion)' },
        price: { type: Type.NUMBER, description: 'Price per quintal in Rupees' },
        quantity: { type: Type.STRING, description: 'Quantity available (e.g., 10 Quintals)' }
      },
      required: ['crop', 'price']
    }
  },
  {
    name: 'navigate_to_screen',
    description: 'Navigate the user to a specific section/screen of the AgriAssist app.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        screen: { 
          type: Type.STRING, 
          enum: ['HOME', 'MARKETPLACE', 'CROP_GUIDE', 'ALERTS', 'PROFILE'],
          description: 'The destination screen ID.' 
        }
      },
      required: ['screen']
    }
  }
];

// --- EXISTING HELPERS ---

export const getCropRecommendation = async (
  soilType: string,
  season: string,
  location: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Act as an expert agronomist. 
      I am a farmer with ${soilType} soil in ${location} during the ${season} season.
      Recommend the top 3 best crops for me to grow.
      For each crop, provide:
      1. Crop Name
      2. Brief reason why it fits my soil/weather.
      3. Estimated duration to harvest.
      
      Format the output as a clean HTML string (using <ul>, <li>, <strong>, <p> tags only) suitable for displaying inside a card. Do not use markdown code blocks or \`\`\`html.
      Keep it concise and encouraging.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Unable to generate recommendation at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't connect to the AgriAssist AI. Please try again later.";
  }
};

export const analyzeSoilReport = async (textReport: string): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        const prompt = `
          Analyze the following soil details provided by a farmer:
          "${textReport}"
          
          Provide a structured summary in HTML format (no markdown blocks):
          <h3>Soil Status: [Good/Average/Poor]</h3>
          <p>Summary of issues...</p>
          <h4>Suggested Actions:</h4>
          <ul>
            <li>[Action 1]</li>
            <li>[Action 2]</li>
          </ul>
          <h4>Suitable Crops:</h4>
          <p>[List of crops]</p>
        `;
    
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
    
        return response.text || "Analysis complete.";
      } catch (error) {
        console.error("Gemini API Error:", error);
        return "Unable to analyze report. Please check your connection.";
      }
}

export const getGovernmentSchemes = async (location: string): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        const prompt = `
          List 3 top active government agricultural schemes available for farmers in ${location} (India).
          Focus on subsidies, insurance, or loans.
          
          Format as a clean HTML list (<ul>, <li>, <strong>, <br>) without markdown blocks.
          For each scheme include: Name, Benefit, and How to Apply.
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });

        return response.text || "No schemes found at the moment.";
    } catch (error) {
        return "Could not fetch schemes. Please try again.";
    }
}

export const getCropGuide = async (cropName: string, aspect: string = 'general'): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Create a comprehensive farming guide for "${cropName}".
      Focus on aspect: ${aspect} (if general, cover all basics).
      
      Include:
      1. Best Sowing Time
      2. Soil & Water Requirements
      3. Fertilizer Schedule
      4. Common Disease Management
      
      Format as clean HTML (<h3>, <ul>, <li>, <p>) without markdown blocks.
    `;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text || "Guide unavailable.";
  } catch (error) {
    return "Could not generate crop guide.";
  }
}

export const getFarmingAlerts = async (location: string): Promise<any[]> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Generate 4 realistic farming alerts for a farmer in ${location} based on current typical weather patterns for this time of year in India.
      Include a mix of Weather, Pest, and Market alerts.
      
      Return JSON only.
    `;
    
    // Using Response Schema for robust JSON parsing
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['weather', 'pest', 'market', 'irrigation'] },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                    date: { type: Type.STRING }
                },
                required: ['id', 'type', 'title', 'description', 'severity', 'date']
            }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Alert generation failed", error);
    return [];
  }
}

// --- UPDATED CHAT FUNCTION WITH TOOLS ---

export const getChatResponse = async (
    history: any[], // Allow flexibility for function calls in history
    currentMessage: string | null, // Can be null if sending function response
    languageName: string,
    toolResponse?: any // { functionResponse: { name, response: { result } } }
): Promise<any> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `
      You are 'Agri-Sahayak', a smart and helpful AI assistant for the AgriAssist app.
      
      About AgriAssist App Features:
      1. **Home**: Shows weather, soil analysis tools, and AI crop recommendations.
      2. **Marketplace (Market)**: Buy and Sell crops. You can help users list their crops here.
      3. **Guide**: Detailed farming guides for various crops.
      4. **Alerts**: Real-time weather and pest alerts.
      5. **Profile**: User settings and farm details.

      Your Capabilities:
      - You can answer farming questions.
      - **You can control the app.** If a user wants to sell a crop, call the \`add_market_listing\` tool.
      - If a user asks to go to a specific screen (like "Take me to market"), call the \`navigate_to_screen\` tool.
      
      **CRITICAL LANGUAGE & CONTROL RULES**:
      1. The user is speaking: **${languageName}**.
      2. **Always respond in ${languageName}** (use the correct script, e.g., Devanagari for Hindi/Marathi, Kannada script for Kannada).
      3. **TRANSLATE INTENT TO ACTIONS**: 
         - If the user gives a command in ${languageName}, you MUST understand the intent and call the relevant English tool.
         - Example (Hindi): "Mujhe bajara bechna hai" -> Call \`add_market_listing\` with crop="Bajra".
         - Example (Marathi): "Market la ja" -> Call \`navigate_to_screen\` with screen="MARKETPLACE".
         - Example (Kannada): "Tomato marata madabeku" -> Call \`add_market_listing\` with crop="Tomato".
         - Example (Kannada): "Marukattege hogo" -> Call \`navigate_to_screen\` with screen="MARKETPLACE".
      4. **DO NOT** just say "I can take you there". **DO IT** by calling the function.
    `;

    // Construct contents
    let contents = [...history];
    
    if (currentMessage) {
        contents.push({ role: 'user', parts: [{ text: currentMessage }] });
    }
    
    if (toolResponse) {
        // If we are sending back a tool execution result
        contents.push({ role: 'function', parts: [toolResponse] });
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: appTools }],
      }
    });

    // We need to return the full response structure to handle function calls in the UI
    const candidate = response.candidates?.[0];
    const functionCalls = candidate?.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall);
    const text = candidate?.content?.parts?.find(p => p.text)?.text;

    return {
        text,
        functionCalls,
        history: contents // Return updated history so client can maintain state
    };

  } catch (error) {
    console.error("Chat Error:", error);
    return { text: "Error connecting to AI." };
  }
}