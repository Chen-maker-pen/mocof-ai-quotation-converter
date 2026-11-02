/** Retry read-only status requests; never replay uploads or dispatch requests. */
export async function readJobResponse(url: string, fetcher: typeof fetch = fetch, pause = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))): Promise<Response> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const response = await fetcher(url, {cache: 'no-store'});
      if (![408, 429, 502, 503, 504].includes(response.status) || attempt === 4) return response;
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      if (attempt === 4) throw new Error('Connection interrupted while checking your saved conversion. Your job has not been restarted. Use Check saved conversion to reconnect.');
    }
    await pause(Math.min(1000 * 2 ** attempt, 8000));
  }
  throw new Error('Could not check the saved conversion.');
}
