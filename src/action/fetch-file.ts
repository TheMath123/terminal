'use server'

import { env } from "@/env";

interface ResponseData {
  ok: boolean;
  content?: string;
  error?: string;  
}

const apiUrl = env.APP_URL

export async function fetchFile(mappedPath: string):Promise<ResponseData> {
  try {
    console.log(apiUrl);
    const path = apiUrl + mappedPath
    console.log(path);
    console.log(env.BEARER_TOKEN);
    const result = await fetch(path , {
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
