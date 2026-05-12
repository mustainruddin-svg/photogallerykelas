import { useState, useEffect } from 'react';
import { Database, Image as ImageIcon, Search, Settings, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { Gallery } from './components/Gallery';
import { fetchPhotosFromSheet, extractSheetId } from './services/sheetService';
import { PhotoItem } from './types';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// Fallback template photos
const TEMPLATE_PHOTOS: PhotoItem[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1523580494112-071dcb849aec?q=80&w=800&auto=format&fit=crop', title: 'Hari Kelulusan', description: 'Kenangan manis bersama teman sekelas.' },
  { id: '2', url: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=800&auto=format&fit=crop', title: 'Study Tour', description: 'Perjalanan ke museum sejarah di luar kota bersama semua.' },
  { id: '3', url: 'https://images.unsplash.com/photo-1511629091441-ee46146481b6?q=80&w=600&auto=format&fit=crop', title: 'Pentas Seni', description: 'Penampilan drama kelas kita yang luar biasa.' },
  { id: '4', url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=600&auto=format&fit=crop', title: 'Belajar Kerja Kelompok', description: 'Mengerjakan tugas akhir bersama.' },
  { id: '5', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop', title: 'Ruang Kelas', description: 'Tempat kita berjuang dan bercanda.' },
];

export default function App() {
  const [sheetId, setSheetId] = useState<string | null>(localStorage.getItem('kelas_gallery_sheet_id'));
  const [sheetInput, setSheetInput] = useState(sheetId || '');
  const [photos, setPhotos] = useState<PhotoItem[]>(TEMPLATE_PHOTOS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(sheetId === null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPhotosFromSheet(id);
      if (data.length > 0) {
        setPhotos(data);
      } else {
        setError('Google Sheet berhasil dibaca, tapi tidak ada data foto yang ditemukan. Pastikan nama kolomnya "url", "title", dan "description".');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke Google Sheet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sheetId) {
      loadData(sheetId);
    }
  }, [sheetId]);

  const handleSaveConfig = () => {
    const id = extractSheetId(sheetInput);
    if (!id) {
      setError('Format URL atau ID tidak valid. Silakan masukkan link lengkap Google Sheet.');
      return;
    }
    setError('');
    setSheetId(id);
    localStorage.setItem('kelas_gallery_sheet_id', id);
    setIsConfigOpen(false);
    loadData(id);
  };

  const handleClearConfig = () => {
    localStorage.removeItem('kelas_gallery_sheet_id');
    setSheetId(null);
    setSheetInput('');
    setPhotos(TEMPLATE_PHOTOS);
    setIsConfigOpen(true);
  };

  const filteredPhotos = photos.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen relative font-sans text-[#4A443F] bg-[#F9F8F4] flex flex-col">
      {/* Search Header */}
      <header className="border-b border-[#E8E4D9] pb-6 mb-8 pt-10 max-w-7xl mx-auto w-full px-6 sm:px-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl font-light italic text-[#5A5A40] font-serif">
            Kenangan Kelas Kita
          </h1>
          <p className="text-[10px] sm:text-xs tracking-widest uppercase opacity-60">Arsip Momen • Galeri Foto</p>
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 text-xs w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#E8E7DF] px-3 py-1.5 rounded-full shrink-0">
            <div className="w-2 h-2 bg-[#8B9A47] rounded-full"></div>
            <span className="font-medium uppercase tracking-tight text-[#4A443F]">Data Google Sheet</span>
          </div>
          
          <div className="flex-1 md:w-48 lg:w-64 relative group shrink-0 min-w-[150px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-[#5A5A40] opacity-50" />
            </div>
            <input
              type="text"
              placeholder="Cari foto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-4 py-1.5 border border-[#E8E4D9] rounded-full leading-5 bg-white/50 focus:outline-none focus:bg-white focus:border-[#8B9A47]/40 text-[#4A443F] placeholder-[#4A443F]/40 transition-all font-sans text-xs"
            />
          </div>
          
          <button
            onClick={() => setIsConfigOpen(true)}
            className="p-1.5 text-[#5A5A40] hover:bg-[#E8E7DF] rounded-full transition-colors flex items-center justify-center shrink-0"
            title="Pengaturan Database"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-10 pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-[#8B9A47]">
            <RefreshCw className="w-10 h-10 animate-spin mb-4 opacity-50" />
            <p className="font-serif italic text-lg text-[#5A5A40]">Memuat Koleksi...</p>
          </div>
        ) : (
           <Gallery photos={filteredPhotos} />
        )}

        {filteredPhotos.length === 0 && !loading && (
          <div className="text-center py-20 bg-white p-8 rounded-[32px] border border-[#EEECE4] shadow-sm max-w-md mx-auto">
             <p className="font-serif italic text-[#5A5A40] text-lg">Tidak ada memori yang sesuai.</p>
             <p className="text-[10px] uppercase tracking-widest opacity-50 mt-2">Coba kata kunci lain atau periksa sheet Anda</p>
          </div>
        )}
      </main>

      {/* Configuration Modal */}
      <AnimatePresence>
        {isConfigOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-[#F9F8F4]/80 backdrop-blur-sm" 
               onClick={() => sheetId && setIsConfigOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] shadow-lg border border-[#EEECE4] p-8 sm:p-10 w-full max-w-2xl relative z-10 text-[#4A443F]"
            >
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#E8E4D9]">
                 <div className="w-12 h-12 bg-[#E8E7DF] rounded-full flex items-center justify-center border border-[#5A5A40]/10">
                    <Database className="w-5 h-5 text-[#5A5A40]" />
                 </div>
                 <div>
                   <h2 className="text-2xl italic font-serif text-[#5A5A40]">Database Google Sheet</h2>
                   <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Konfigurasi Sumber Data</p>
                 </div>
              </div>

              <div className="bg-[#F9F8F4] rounded-[24px] p-6 mb-6 border border-[#E8E4D9]">
                <h3 className="font-medium text-sm text-[#4A443F] mb-3 border-b border-[#E8E4D9] pb-2">Instruksi Pengaturan:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-[#5A5A40]/80">
                  <li>Buat Google Sheet baru di akun Google Anda.</li>
                  <li>Ubah pengaturan Share menjadi <strong className="text-[#4A443F]">"Anyone with the link can view"</strong>.</li>
                  <li>Buat persis nama kolom di baris pertama: <strong className="text-[#8B9A47]">url</strong>, <strong className="text-[#8B9A47]">title</strong>, <strong className="text-[#8B9A47]">description</strong>.</li>
                  <li>Isi baris dibawahnya dengan data foto Anda.</li>
                  <li>Copy link public Google Sheet Anda dan paste di bawah.</li>
                </ol>
              </div>

              {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-[20px] flex gap-3 text-sm mb-6 items-start border border-red-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#5A5A40]">URL Google Sheet</label>
                <input
                  type="text"
                  value={sheetInput}
                  onChange={(e) => setSheetInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-4 py-3 border border-[#E8E4D9] bg-white rounded-[20px] focus:outline-none focus:border-[#8B9A47] focus:ring-1 focus:ring-[#8B9A47] transition-colors text-sm"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-[#E8E4D9]">
                {sheetId && (
                  <button
                    onClick={handleClearConfig}
                    className="px-6 py-2.5 text-[11px] uppercase tracking-widest font-semibold border border-[#E8E4D9] text-[#5A5A40] hover:bg-[#F9F8F4] rounded-[20px] transition-colors"
                  >
                    Hapus Data
                  </button>
                )}
                {sheetId && (
                   <button
                   onClick={() => {
                     setIsConfigOpen(false);
                     setError('');
                   }}
                   className="px-6 py-2.5 text-[11px] uppercase tracking-widest font-semibold text-[#5A5A40] hover:bg-[#F9F8F4] rounded-[20px] transition-colors"
                 >
                   Batal
                 </button>
                )}
                <button
                  onClick={handleSaveConfig}
                  className="px-6 py-2.5 text-[11px] uppercase tracking-widest font-semibold bg-[#E8E7DF] hover:bg-[#DEDCD4] text-[#4A443F] rounded-[20px] flex items-center justify-center gap-2 transition-colors border border-[#E8E4D9]"
                >
                  <Save className="w-4 h-4 opacity-70" />
                  Simpan & Sinkronisasi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
