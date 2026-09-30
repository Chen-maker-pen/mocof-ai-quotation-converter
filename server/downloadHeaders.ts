/** RFC 5987 UTF-8 filename; source filenames commonly contain Chinese. */
export function attachmentDisposition(filename: string) {
  const encoded = encodeURIComponent(filename).replace(/['()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return `attachment; filename="MOCOF_Quotation.xlsx"; filename*=UTF-8''${encoded}`;
}
