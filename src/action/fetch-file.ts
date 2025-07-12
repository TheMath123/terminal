'use server'

interface ResponseData {
  ok: boolean;
  content?: string;
  error?: string;  
}

const apiUrl =
 process.env.VERCEL === '1' ? `https://${process.env.VERCEL_URL}` : `http://${process.env.VERCEL_URL}`;

export async function fetchFile(mappedPath: string):Promise<ResponseData> {
  try {
    const result = await fetch(apiUrl + '/'+mappedPath, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
      }
    })
    const content = await result.text()
    return {
      ok: result.ok,
      content: content,
    }
  } catch (error) {
    console.log('Error fetching file:', error);
    return {
      ok: false,
      error: 'File is unattainable, sorry =(',
    }
  }
}