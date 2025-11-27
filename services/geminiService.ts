import { GoogleGenAI, Type } from "@google/genai";
import { MediaSource, TranscriptionResult } from "../types";

export const transcribeAudio = async (media: MediaSource): Promise<TranscriptionResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found in environment variables.");
    }

    // Handle YouTube case
    if (media.type === 'youtube') {
      // NOTE: In a pure client-side environment (browser), we cannot download the YouTube audio 
      // stream due to CORS and browser security policies. 
      // The Gemini API does not accept YouTube URLs directly in 'parts' unless they are Google Cloud Storage URIs.
      // 
      // To solve this in a real-world app, you would need a small backend service that:
      // 1. Receives the YouTube URL
      // 2. Downloads the audio (using ytdl-core or similar)
      // 3. Returns the audio stream or uploads it to Gemini
      
      // Since this is a client-side demo, we simulate a delay and return an explanatory message 
      // to the user within the transcript area so they understand the limitation.
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing

      return {
        text: `[LIMITAÇÃO TÉCNICA]\n\nInfelizmente, não é possível extrair o áudio de vídeos do YouTube diretamente pelo navegador devido a restrições de segurança (CORS) e políticas da plataforma.\n\nPara que esta funcionalidade funcione em produção, seria necessário um servidor backend intermediário para baixar o áudio e enviá-lo para a IA.\n\nEste é um exemplo de como a interface funcionaria:\n\n1. O link "${media.data.url}" seria enviado ao servidor.\n2. O servidor extrairia o áudio.\n3. O Gemini transcreveria o conteúdo.\n\nPor enquanto, experimente usar a aba "Upload Arquivo" com um arquivo MP3 baixado!`,
        segments: [],
        timestamp: Date.now()
      };
    }

    // Handle File case
    const audioFile = media.data;
    const ai = new GoogleGenAI({ apiKey });
    // gemini-2.5-flash is good for this
    const modelName = "gemini-2.5-flash";

    if (!audioFile.base64) {
      throw new Error("Audio data is missing base64 content.");
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioFile.mimeType,
              data: audioFile.base64,
            },
          },
          {
            text: `You are a professional transcriber. Transcribe this audio accurately in Portuguese (or the original language).
            
            Output strictly JSON matching this schema:
            {
              "text": "The full transcription text formatted in paragraphs.",
              "segments": [
                { "startTime": "00:00:00,000", "endTime": "00:00:05,000", "text": "Segment text" }
              ]
            }
            
            Requirements:
            1. 'text' should be the complete, readable transcription.
            2. 'segments' should break down the audio for subtitles. Timestamps must be in SRT format (HH:MM:SS,mmm) or closest equivalent.
            3. Identify speakers if possible in the text.
            `,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const resultText = response.text;

    if (!resultText) {
      throw new Error("No transcript generated.");
    }

    const parsed = JSON.parse(resultText) as TranscriptionResult;
    return {
        ...parsed,
        timestamp: Date.now()
    };

  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
};
