/**
 * TOON (Token-Oriented Object Notation) Parser and Converter
 * 
 * TOON Format (Standard JSON with quoted keys):
 * - Objects: {"key": "value", "key2": "value2"}
 * - Arrays: ["item1", "item2", "item3"]
 * - Strings: "text"
 * - Numbers: 123, 45.67
 * - Booleans: true, false
 * - Null: null
 * - Nested structures supported
 * 
 * JSON Format (Unquoted keys):
 * - Objects: {key: "value", key2: "value2"}
 * - Arrays: ["item1", "item2"]
 * - Same data types as TOON
 */

export interface ParseResult {
  value: any;
  remaining: string;
}

/**
 * Parse a TOON string (standard JSON format) into a JavaScript object
 */
export function parseToon(input: string): any {
  try {
    // TOON is standard JSON, so we can use JSON.parse
    return JSON.parse(input);
  } catch (error: any) {
    throw new Error(`Invalid TOON format: ${error.message}`);
  }
}

function parseValue(input: string): ParseResult {
  const trimmed = input.trim();
  
  if (trimmed.startsWith('{')) {
    return parseObject(trimmed);
  } else if (trimmed.startsWith('[')) {
    return parseArray(trimmed);
  } else if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
    return parseString(trimmed);
  } else if (trimmed.match(/^-?\d+(\.\d+)?([eE][+-]?\d+)?/)) {
    return parseNumber(trimmed);
  } else if (trimmed.startsWith('true')) {
    return { value: true, remaining: trimmed.substring(4) };
  } else if (trimmed.startsWith('false')) {
    return { value: false, remaining: trimmed.substring(5) };
  } else if (trimmed.startsWith('null')) {
    return { value: null, remaining: trimmed.substring(4) };
  } else {
    throw new Error(`Unexpected token: ${trimmed.substring(0, 20)}`);
  }
}

/**
 * Parse JSON format (with unquoted keys) into a JavaScript object
 */
export function parseJson(input: string): any {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Empty input');
  }

  const result = parseValue(trimmed);
  if (result.remaining.trim()) {
    throw new Error(`Unexpected characters after parsed value: ${result.remaining.substring(0, 20)}`);
  }
  return result.value;
}

function parseObject(input: string): ParseResult {
  if (!input.startsWith('{')) {
    throw new Error('Expected object to start with {');
  }
  
  let remaining = input.substring(1);
  const obj: any = {};
  
  // Skip whitespace
  remaining = remaining.trim();
  
  if (remaining.startsWith('}')) {
    return { value: obj, remaining: remaining.substring(1) };
  }
  
  while (true) {
    remaining = remaining.trim();
    if (!remaining) break;
    
    // Parse key (allow unquoted keys for JSON format)
    let key: string;
    let keyMatch: RegExpMatchArray | null = null;
    
    if (remaining.startsWith('"') || remaining.startsWith("'")) {
      const keyResult = parseString(remaining);
      key = keyResult.value;
      remaining = keyResult.remaining.trim();
    } else {
      // Allow unquoted keys - match identifier
      keyMatch = remaining.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/);
      if (!keyMatch) {
        throw new Error(`Expected key, got: ${remaining.substring(0, 30)}`);
      }
      key = keyMatch[1];
      // Skip key and colon
      remaining = remaining.substring(keyMatch[0].length).trim();
    }
    
    // If we didn't consume the colon above (quoted key), expect it now
    if (!keyMatch && !remaining.startsWith(':')) {
      throw new Error(`Expected ':' after key, got: ${remaining.substring(0, 30)}`);
    }
    if (!keyMatch && remaining.startsWith(':')) {
      remaining = remaining.substring(1).trim();
    }
    
    // Parse value
    const valueResult = parseValue(remaining);
    obj[key] = valueResult.value;
    remaining = valueResult.remaining.trim();
    
    // Check for comma or closing brace
    if (remaining.startsWith('}')) {
      return { value: obj, remaining: remaining.substring(1) };
    } else if (remaining.startsWith(',')) {
      remaining = remaining.substring(1).trim();
    } else if (remaining.length > 0) {
      throw new Error(`Expected ',' or '}', got: ${remaining.substring(0, 30)}`);
    } else {
      break;
    }
  }
  
  return { value: obj, remaining };
}

function parseArray(input: string): ParseResult {
  if (!input.startsWith('[')) {
    throw new Error('Expected array to start with [');
  }
  
  let remaining = input.substring(1).trim();
  const arr: any[] = [];
  
  if (remaining.startsWith(']')) {
    return { value: arr, remaining: remaining.substring(1) };
  }
  
  while (true) {
    remaining = remaining.trim();
    
    // Parse value
    const valueResult = parseValue(remaining);
    arr.push(valueResult.value);
    remaining = valueResult.remaining.trim();
    
    // Check for comma or closing bracket
    if (remaining.startsWith(']')) {
      return { value: arr, remaining: remaining.substring(1) };
    } else if (remaining.startsWith(',')) {
      remaining = remaining.substring(1).trim();
    } else {
      throw new Error(`Expected ',' or ']', got: ${remaining.substring(0, 20)}`);
    }
  }
}

function parseString(input: string): ParseResult {
  const quote = input[0];
  if (quote !== '"' && quote !== "'") {
    throw new Error('Expected string to start with quote');
  }
  
  let value = '';
  let i = 1;
  let escaped = false;
  
  while (i < input.length) {
    const char = input[i];
    
    if (escaped) {
      if (char === 'n') value += '\n';
      else if (char === 't') value += '\t';
      else if (char === 'r') value += '\r';
      else if (char === '\\') value += '\\';
      else if (char === quote) value += quote;
      else value += char;
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === quote) {
      return { value, remaining: input.substring(i + 1) };
    } else {
      value += char;
    }
    
    i++;
  }
  
  throw new Error('Unterminated string');
}

function parseNumber(input: string): ParseResult {
  const match = input.match(/^(-?\d+(\.\d+)?([eE][+-]?\d+)?)/);
  if (!match) {
    throw new Error('Expected number');
  }
  
  const numStr = match[1];
  const num = parseFloat(numStr);
  return { value: num, remaining: input.substring(numStr.length) };
}

/**
 * Convert a JavaScript object to TOON format (standard JSON with quoted keys)
 * Uses compact formatting for small objects to match input style
 */
export function toToon(obj: any, indent: number = 0): string {
  const indentStr = '  '.repeat(indent);
  const nextIndent = indent + 1;
  const nextIndentStr = '  '.repeat(nextIndent);
  
  if (obj === null) {
    return 'null';
  }
  
  if (typeof obj === 'boolean') {
    return obj ? 'true' : 'false';
  }
  
  if (typeof obj === 'number') {
    return obj.toString();
  }
  
  if (typeof obj === 'string') {
    // Escape the string
    const escaped = obj
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return `"${escaped}"`;
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return '[]';
    }
    
    // Check if array items are simple objects that can be compact (like { "id": 1, "name": "Alice", "role": "admin" })
    const isCompactArray = obj.every(item => 
      typeof item === 'object' && item !== null && !Array.isArray(item) &&
      Object.keys(item).length <= 5 &&
      Object.values(item).every(val => typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || val === null)
    );
    
    if (isCompactArray) {
      const items = obj.map(item => {
        const pairs = Object.keys(item).map(key => {
          const keyStr = `"${key}"`;
          const valueStr = toToon(item[key], 0);
          return `${keyStr}: ${valueStr}`;
        });
        return `{ ${pairs.join(', ')} }`;
      });
      return `[\n${nextIndentStr}${items.join(',\n' + nextIndentStr)}\n${indentStr}]`;
    }
    
    const items = obj.map(item => `${nextIndentStr}${toToon(item, nextIndent)}`);
    return `[\n${items.join(',\n')}\n${indentStr}]`;
  }
  
  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return '{}';
    }
    
    // Check if object can be compact (small number of simple properties)
    const isCompactObject = keys.length <= 5 && 
      keys.every(key => {
        const val = obj[key];
        return typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || val === null || 
               (Array.isArray(val) && val.length <= 10);
      });
    
    if (isCompactObject && indent === 0) {
      // For root level, check if values are arrays that should be formatted
      const pairs = keys.map(key => {
        const keyStr = `"${key}"`;
        const val = obj[key];
        if (Array.isArray(val) && val.length > 0) {
          // Format array with compact objects
          const items = val.map(item => {
            if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
              const itemPairs = Object.keys(item).map(k => {
                const kStr = `"${k}"`;
                const vStr = toToon(item[k], 0);
                return `${kStr}: ${vStr}`;
              });
              return `{ ${itemPairs.join(', ')} }`;
            }
            return toToon(item, 0);
          });
          return `${keyStr}: [\n${nextIndentStr}${items.join(',\n' + nextIndentStr)}\n${indentStr}]`;
        }
        return `${keyStr}: ${toToon(val, 0)}`;
      });
      return `{\n${nextIndentStr}${pairs.join(',\n' + nextIndentStr)}\n${indentStr}}`;
    }
    
    const pairs = keys.map(key => {
      const keyStr = `"${key}"`;
      const valueStr = toToon(obj[key], nextIndent);
      return `${nextIndentStr}${keyStr}: ${valueStr}`;
    });
    
    return `{\n${pairs.join(',\n')}\n${indentStr}}`;
  }
  
  throw new Error(`Cannot convert to TOON: ${typeof obj}`);
}

/**
 * Convert a JavaScript object to JSON format (unquoted keys)
 */
export function toJson(obj: any, indent: number = 0): string {
  const indentStr = '  '.repeat(indent);
  const nextIndent = indent + 1;
  const nextIndentStr = '  '.repeat(nextIndent);
  
  if (obj === null) {
    return 'null';
  }
  
  if (typeof obj === 'boolean') {
    return obj ? 'true' : 'false';
  }
  
  if (typeof obj === 'number') {
    return obj.toString();
  }
  
  if (typeof obj === 'string') {
    // Escape the string
    const escaped = obj
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return `"${escaped}"`;
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return '[]';
    }
    
    const items = obj.map(item => `${nextIndentStr}${toJson(item, nextIndent)}`);
    return `[\n${items.join(',\n')}\n${indentStr}]`;
  }
  
  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return '{}';
    }
    
    const pairs = keys.map(key => {
      // Use unquoted key if it's a valid identifier, otherwise quote it
      const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : toJson(key, 0);
      const valueStr = toJson(obj[key], nextIndent);
      return `${nextIndentStr}${keyStr}: ${valueStr}`;
    });
    
    return `{\n${pairs.join(',\n')}\n${indentStr}}`;
  }
  
  throw new Error(`Cannot convert to JSON: ${typeof obj}`);
}

