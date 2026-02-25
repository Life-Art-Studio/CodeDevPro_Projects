"use strict";
// const axios = require("axios");
const prompt = document.getElementById("prompt");
const model = document.getElementById("model");
const quality = document.getElementById("quality");
const imgCount = document.getElementById("image-count");

const submitBtn = document.getElementById("submit-btn");
const imageContainer = document.getElementById("image-container");

// submitBtn.addEventListener("click", (e) => {
//   e.preventDefault();
//   let promptValue = prompt.value;
// let modelValue = model.value;
// let qualityValue = quality.value;
//   puter.ai.txt2img(promptValue, { model: modelValue, quality: qualityValue })
//     .then(imageElement => {
//         imageContainer.appendChild(imageElement);
//     })
//     .catch(error => {
//         console.error(error);
//     });
// });

// const options = {
//   method: 'POST',
//   headers: {'x-freepik-api-key': 'FPSXafd9065ea5dd7e48ec9b7c3ceb9118ba', 'Content-Type': 'application/json'},
//   body: JSON.stringify({
//     prompt: prompt.value,
//     webhook_url: 'https://www.example.com/webhook',
//     structure_reference: 'aSDinaTvuI8gbWludGxpZnk=',
//     structure_strength: 50,
//     style_reference: 'aSDinaTvuI8gbWludGxpZnk=',
//     adherence: 50,
//     hdr: 50,
//     resolution: '2k',
//     aspect_ratio: 'square_1_1',
//     model: model.value,
//     creative_detailing: 33,
//     engine: 'automatic',
//     fixed_generation: false,
//     filter_nsfw: true,
//     styling: {
//       styles: [{name: '<string>', strength: 100}],
//       characters: [{strength: 100, id: '<string>'}],
//       colors: [{color: '#FF0000', weight: 0.5}]
//     }
//   })
// };

const API_KEY = "AIzaSyDIMYHP1MwxCk4-94eOq_sNPEgcrXBdQeQ";
const MODEL_NAME = "gemini-2.5-flash-image";

// 1. Construct the endpoint URL
const url = `https://generativelanguage.googleapis.com/${MODEL_NAME}:generateContent?key=${API_KEY}`;

// 2. Define the payload (matches SDK 'generateContent' input)
const payload = {
  contents: [
    {
      parts: [
        { text: "A neon-lit cyberpunk street." }
      ]
    }
  ]
};

async function generateImage() {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    // 3. Access the Base64 image data
    // Structure: candidates[0] -> content -> parts[0] -> inlineData -> data
    const base64Image = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Image) {
      console.log("Image generated successfully!");
      // Example: Display it in an <img> tag
      // document.getElementById("myImage").src = `data:image/png;base64,${base64Image}`;
    } else {
      console.error("No image data found in response:", data);
    }

  } catch (error) {
    console.error("Generation failed:", error);
  }
}

generateImage();