import Papa from 'papaparse';
import { PhotoItem } from '../types';

export const extractSheetId = (url: string): string | null => {
  if (url.length === 44 && !url.includes('/')) return url; // Might be raw ID
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

export async function fetchPhotosFromSheet(sheetId: string): Promise<PhotoItem[]> {
  // Use gviz/tq endpoint which is good for public CSV fetching without hitting CORS limits as easily
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

  return new Promise((resolve, reject) => {
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0 && !results.data.length) {
          console.error("CSV Parse Errors:", results.errors);
          reject(new Error("Gagal membaca Google Sheet. Pastikan link sudah diset 'Anyone with the link can view' dan formatnya benar."));
          return;
        }

        const data = results.data as any[];
        const photos: PhotoItem[] = data
          .map((row, index) => {
            // Support multiple column name variations (case-insensitive checking)
            const getVal = (keys: string[]) => {
              const matchedKey = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
              return matchedKey ? row[matchedKey] : '';
            };

            const url = getVal(['url', 'link', 'foto', 'photo', 'image']);
            if (!url) return null; // Skip if no URL

            return {
              id: `${index}-${Date.now()}`,
              url: url,
              title: getVal(['title', 'judul', 'nama']) || 'Tanpa Judul',
              description: getVal(['description', 'deskripsi', 'caption', 'keterangan']) || '',
            };
          })
          .filter(Boolean) as PhotoItem[]; // Remove nulls

        resolve(photos);
      },
      error: (error) => {
        console.error("PapaParse Error:", error);
        reject(new Error("Gagal mengambil data dari Google Sheet. Periksa koneksi atau ID Sheet."));
      }
    });
  });
}
