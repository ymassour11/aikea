// Vercel Serverless Function - Secure API endpoint for room design
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { compositeImage, roomImage, furnitureGridImage, furnitureImages, furnitureNames, mimeType, roomType = 'livingRoom' } = req.body;

    // Get API key from environment variable (secure!)
    const API_KEY = process.env.GEMINI_API_KEY;

    // Debug log (remove in production)
    console.log('API_KEY exists:', !!API_KEY);
    console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI')));

    if (!API_KEY) {
      return res.status(500).json({
        error: 'API key not configured',
        debug: {
          hasKey: !!API_KEY,
          envKeys: Object.keys(process.env).filter(k => k.includes('GEMINI'))
        }
      });
    }

    // Build the request to Gemini 2.5 Flash (supports image input + output)
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${API_KEY}`;

    let parts = [];

    // Two-image approach: room + furniture grid (SEPARATE images)
    if (furnitureGridImage) {
      parts = [
        {
          inline_data: {
            mime_type: mimeType,
            data: roomImage
          }
        },
        {
          inline_data: {
            mime_type: 'image/png',
            data: furnitureGridImage
          }
        },
        {
          text: `Place all the furniture items from the second image into the empty room shown in the first image. Generate the complete furnished room with realistic feel and realistic furniture well positioned in the room. Show only the final furnished room image.`
        }
      ];
    }
    // If composite image is provided, use simple approach
    else if (compositeImage) {
      parts = [
        {
          inline_data: {
            mime_type: mimeType,
            data: compositeImage
          }
        },
        {
          text: `Place the furniture into the empty room. Show the complete furnished room with realistic placement. Output only the final furnished room image.`
        }
      ];
    } else {
      // Old approach - send room image BEFORE each furniture piece
      parts = [
        {
          text: "This is the EMPTY ROOM:"
        },
        {
          inline_data: {
            mime_type: mimeType,
            data: roomImage
          }
        }
      ];

      // Add furniture images
      furnitureImages.forEach((furniture, index) => {
        parts.push({
          text: `Furniture piece ${index + 1}:`
        });
        parts.push({
          inline_data: {
            mime_type: 'image/png',
            data: furniture
          }
        });
      });

      parts.push({
        text: `Place all the furniture pieces into the empty room. Show the complete furnished room with realistic lighting and shadows. Output only the final furnished room image.`
      });
    }

    const requestBody = {
      contents: [{
        parts: parts
      }],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"]
      }
    };

    // Call Gemini API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'API request failed'
      });
    }

    // Extract image from Gemini response
    if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inline_data || part.inlineData) {
          const imageData = part.inline_data || part.inlineData;
          return res.status(200).json({
            success: true,
            image: `data:${imageData.mime_type || imageData.mimeType};base64,${imageData.data}`
          });
        }
      }
    }

    // If no image, return text response
    const designText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No design generated';
    return res.status(200).json({
      success: false,
      text: designText
    });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
