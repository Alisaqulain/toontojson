import type { NextApiRequest, NextApiResponse } from 'next';
import { parseJson, toToon } from '@/lib/toon';

type ResponseData = {
  data?: string;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data } = req.body;
    
    if (!data || typeof data !== 'string') {
      return res.status(400).json({ error: 'Invalid input: expected a string' });
    }

    // Parse JSON (unquoted keys) to JavaScript object
    const parsed = parseJson(data);
    
    // Convert to TOON format (standard JSON with quoted keys)
    const toon = toToon(parsed);
    
    return res.status(200).json({ data: toon });
  } catch (error: any) {
    return res.status(400).json({ 
      error: error.message || 'Invalid JSON format' 
    });
  }
}

