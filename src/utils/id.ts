let counter = Math.floor(Math.random() * 0xffffff);

/**
 * Generates a 24-character hexadecimal string that closely matches a MongoDB ObjectId.
 * This includes a 4-byte timestamp, a 5-byte random value, and a 3-byte incrementing counter.
 */
export function generateObjectId(): string {
  // 4-byte timestamp value (8 hex chars)
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  
  // 5-byte random value (10 hex chars)
  const randomValue = Array.from({ length: 10 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  // 3-byte incrementing counter (6 hex chars)
  counter = (counter + 1) % 0xffffff;
  const counterValue = counter.toString(16).padStart(6, '0');

  return timestamp + randomValue + counterValue;
}
