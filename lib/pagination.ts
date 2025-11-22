// Cursor-based pagination utilities for better performance on large datasets

export interface PaginationOptions {
  pageSize: number;
  cursor?: string; // Last document ID from previous page
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  totalItems: number;
}

/**
 * Create a cursor from a document ID
 * In production, could be encrypted/signed for security
 */
export const createCursor = (docId: string): string => {
  return Buffer.from(docId).toString('base64');
};

/**
 * Decode a cursor back to document ID
 */
export const decodeCursor = (cursor: string): string => {
  try {
    return Buffer.from(cursor, 'base64').toString('utf-8');
  } catch {
    return '';
  }
};

/**
 * Create paginated result response
 */
export const createPaginatedResult = <T>(
  items: T[],
  pageSize: number,
  getDocId: (item: T) => string,
  totalItems: number = items.length
): PaginatedResult<T> => {
  const hasMore = items.length > pageSize;
  const paginatedItems = items.slice(0, pageSize);
  const nextCursor = hasMore && paginatedItems.length > 0 
    ? createCursor(getDocId(paginatedItems[paginatedItems.length - 1]))
    : null;

  return {
    items: paginatedItems,
    nextCursor,
    hasMore,
    totalItems
  };
};
