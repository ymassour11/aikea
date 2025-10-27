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
    const { roomImage, furnitureImages, furnitureNames, mimeType } = req.body;

    // Get API key from environment variable (secure!)
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Build the request to Google Gemini API
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`;

    // Build request with ROOM IMAGE TWICE (first and last)
    const parts = [
      {
        text: "This is the target room - remember it exactly:"
      },
      {
        inline_data: {
          mime_type: mimeType,
          data: roomImage
        }
      },
      {
        text: `Now here are ${furnitureImages.length} furniture pieces to add:`
      }
    ];

    // Add all furniture images
    furnitureImages.forEach(furniture => {
      parts.push({
        inline_data: {
          mime_type: 'image/png',
          data: furniture
        }
      });
    });

    // Add room again and final instruction
    parts.push({
      text: "And here is the room again - THIS is the base:"
    });
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: roomImage
      }
    });
    parts.push({
      text: `Generate this exact room (shown twice above) with the furniture pieces shown (${furnitureNames.join(', ')}) placed inside it. IMPORTANT:
1. Keep the room IDENTICAL - same walls, floor, windows, lighting
2. Keep the furniture EXACTLY as shown - do not change their design, color, or style
3. Position the furniture in ELEGANT, professional arrangements that maximize space and flow
4. Add tasteful accessories like cushions, throws, small decor items, artwork, and styling elements to complete the look
5. Ensure proper perspective, realistic lighting, and natural shadows
Create a beautifully styled, magazine-worthy room design.`
    });

    const requestBody = {
      contents: [{
        parts: parts
      }]
    };

    // Call Google Gemini API
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

    // Extract image from response
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
