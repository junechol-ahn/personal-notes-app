export async function register() {
  try {
    // Only run if we are in a runtime that supports bun:sqlite
    // And avoid running during static generation if possible?
    // Check for Bun global just in case.
    if (typeof Bun !== 'undefined') {
      const { initDB } = await import('@/lib/db');
      initDB();
    }
  } catch (e) {
    // Ignore during build if it fails or if environment mismatch
    console.warn('Database initialization skipped or failed:', e);
  }
}
