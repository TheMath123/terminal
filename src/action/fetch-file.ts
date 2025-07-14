'use server'

import { env } from "@/env";

interface ResponseData {
  ok: boolean;
  content?: string;
  error?: string;  
}

const apiUrl = env.VERCEL === '1' ? `https://${env.VERCEL_URL}` : `http://${env.VERCEL_URL}`;

export async function fetchFile(mappedPath: string):Promise<ResponseData> {
  try {
    console.log(apiUrl);
    const result = await fetch(apiUrl + '/'+mappedPath, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.BEARER_TOKEN}`,
      }
    })
    const content = await result.text()
    return {
      ok: result.ok,
      content: content,
    }
  } catch (error) {
    console.error( error);
    return {
      ok: false,
      error: 'File is unattainable, sorry =(',
    }
  }
}
