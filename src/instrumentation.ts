export async function register() {
  try {
    console.log('Registering instrumentation...');
    // Use standard dynamic import
    const { initDB } = await import('@/lib/db');
    await initDB();
  } catch (e) {
    // Ignore during build if it fails or if environment mismatch (e.g. missing env vars)
    console.warn(
      'Database initialization skipped or failed during instrumentation:',
      e,
    );
  }
}
