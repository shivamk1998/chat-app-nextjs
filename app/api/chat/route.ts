import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface OpenAIResponse {
  choices: { message: { content: string } }[];
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    console.log('Received message:', message);

    const response = await axios.post<OpenAIResponse>(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert full-stack web developer. Answer should be well formatted' },
          { role: 'user', content: message }
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('API response:', response.data);

    return NextResponse.json({ response: response.data.choices[0].message.content });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('Axios error:', err.response ? err.response.data : err.message);
      return NextResponse.json({ error: err.response ? err.response.data : err.message }, { status: 500 });
    } else {
      console.error('Unexpected error:', err);
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
  }
}
