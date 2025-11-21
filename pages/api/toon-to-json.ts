import type { NextApiRequest, NextApiResponse } from 'next';
import { parseToon, toJson } from '@/lib/toon';

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

    // Parse TOON (standard JSON) to JavaScript object
    const parsed = parseToon(data);
    
    // Convert to JSON format (unquoted keys)
    const json = toJson(parsed);
    
    return res.status(200).json({ data: json });
  } catch (error: any) {
    return res.status(400).json({ 
      error: error.message || 'Invalid TOON format' 
    });
  }
}

