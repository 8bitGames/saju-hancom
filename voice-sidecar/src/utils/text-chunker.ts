/**
 * Text Chunker for Streaming TTS
 *
 * Splits long text into sentence-level chunks for sequential TTS generation.
 * This dramatically reduces time-to-first-audio for long responses.
 *
 * Korean sentence endings: 요, 다, 까, 죠, 네, 지, 군, 라, 나
 * Punctuation: . ! ? 。
 */

// Maximum characters per chunk (prevents very long sentences from blocking)
const MAX_CHUNK_LENGTH = 150;

// Minimum characters per chunk (prevents tiny chunks that sound choppy)
const MIN_CHUNK_LENGTH = 20;

/**
 * Split text into sentence-level chunks for streaming TTS
 *
 * Strategy:
 * 1. Split on sentence-ending punctuation and Korean endings
 * 2. If a chunk is too long, split on commas or natural breaks
 * 3. If still too long, split at MAX_CHUNK_LENGTH
 * 4. Merge very short chunks with adjacent ones
 */
export function splitTextIntoChunks(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // If text is short enough, return as single chunk
  if (text.length <= MAX_CHUNK_LENGTH) {
    return [text.trim()];
  }

  const chunks: string[] = [];

  // Regex for sentence boundaries
  // Matches: Korean endings + punctuation, or standalone punctuation
  const sentenceEndRegex = /([요다까죠네지군라나][.!?。]?|[.!?。])\s*/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = sentenceEndRegex.exec(text)) !== null) {
    const endIndex = match.index + match[0].length;
    const chunk = text.slice(lastIndex, endIndex).trim();

    if (chunk.length > 0) {
      // If chunk is too long, split it further
      if (chunk.length > MAX_CHUNK_LENGTH) {
        chunks.push(...splitLongChunk(chunk));
      } else {
        chunks.push(chunk);
      }
    }

    lastIndex = endIndex;
  }

  // Handle remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim();
    if (remaining.length > 0) {
      if (remaining.length > MAX_CHUNK_LENGTH) {
        chunks.push(...splitLongChunk(remaining));
      } else {
        chunks.push(remaining);
      }
    }
  }

  // Merge very short chunks
  return mergeShortChunks(chunks);
}

/**
 * Split a long chunk on commas or natural breaks
 */
function splitLongChunk(text: string): string[] {
  const chunks: string[] = [];

  // Try splitting on commas first
  const commaSplit = text.split(/[,，、]\s*/);

  if (commaSplit.length > 1) {
    let current = "";
    for (const part of commaSplit) {
      if (current.length + part.length + 2 <= MAX_CHUNK_LENGTH) {
        current = current ? `${current}, ${part}` : part;
      } else {
        if (current) chunks.push(current.trim());
        current = part;
      }
    }
    if (current) chunks.push(current.trim());
    return chunks;
  }

  // Force split at MAX_CHUNK_LENGTH if no natural breaks
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + MAX_CHUNK_LENGTH, text.length);

    // Try to break at a space if not at the end
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(" ", end);
      if (lastSpace > start + MIN_CHUNK_LENGTH) {
        end = lastSpace;
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end;
  }

  return chunks;
}

/**
 * Merge very short chunks with adjacent ones
 */
function mergeShortChunks(chunks: string[]): string[] {
  if (chunks.length <= 1) return chunks;

  const merged: string[] = [];
  let current = "";

  for (const chunk of chunks) {
    if (current.length === 0) {
      current = chunk;
    } else if (current.length < MIN_CHUNK_LENGTH) {
      // Merge short chunk with next
      current = `${current} ${chunk}`;
    } else if (chunk.length < MIN_CHUNK_LENGTH && current.length + chunk.length + 1 <= MAX_CHUNK_LENGTH) {
      // Merge next short chunk with current
      current = `${current} ${chunk}`;
    } else {
      merged.push(current);
      current = chunk;
    }
  }

  if (current) {
    merged.push(current);
  }

  return merged;
}
