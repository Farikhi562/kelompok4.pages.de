/**
 * =======================================================================
 * OMNI-SEARCH ENGINE (LEVEL DEWA) - KELOMPOK IV AGAMA ISLAM
 * File: search.js
 * Deskripsi: Mesin pencarian global client-side dengan fitur Cmd/Ctrl + K,
 * Indexing Otomatis, Voice Search, dan Keyboard Navigation.
 * =======================================================================
 */

class OmniSearchEngine {
    constructor() {
        // --- DATABASE INDEXING GLOBAL (Mini Database) ---
        // Karena ini web statis, kita index manual konten dari semua halaman
        this.database = [
            // Kategori: Tim
            { id: "tim-1", title: "Muhamad Fauzan Al Farikhi", type: "Anggota Tim", url: "tim.html", keywords: ["fauzan", "ketua", "analis", "50425672", "pembuat makalah"] },
            { id: "tim-2", title: "Yusuf Maulana Wahyudi", type: "Anggota Tim", url: "tim.html", keywords: ["yusuf", "ui", "ux", "desainer", "51425323"] },
            { id: "tim-3", title: "Mahardieka Yusuf Nugraha", type: "Anggota Tim", url: "tim.html", keywords: ["dieka", "mahardieka", "hadits", "referensi", "50425600"] },
            { id: "tim-4", title: "Muhammad Fairuz Kurniawan", type: "Anggota Tim", url: "tim.html", keywords: ["fairuz", "penyusun", "makalah", "50425749"] },
            { id: "tim-5", title: "Qinnan Ashiddiq Arianto", type: "Anggota Tim", url: "tim.html", keywords: ["qinnan", "editor", "qc", "51425003"] },
            
            // Kategori: Tokoh Filsafat
            { id: "tokoh-1", title: "Al-Kindi", type: "Tokoh Filsafat", url: "tokoh.html", keywords: ["alkindi", "faylasuf", "arab", "yunani", "penerjemah"] },
            { id: "tokoh-2", title: "Al-Farabi", type: "Tokoh Filsafat", url: "tokoh.html", keywords: ["alfarabi", "guru kedua", "madinah fadhilah", "politik"] },
            { id: "tokoh-3", title: "Ibnu Sina (Avicenna)", type: "Tokoh Filsafat", url: "tokoh.html", keywords: ["ibnu sina", "avicenna", "wajib al wujud", "kedokteran", "metafisika"] },
            { id: "tokoh-4", title: "Al-Ghazali", type: "Tokoh Filsafat", url: "tokoh.html", keywords: ["ghazali", "tahafut", "kritik filsafat", "tasawuf", "ihya"] },
            { id: "tokoh-5", title: "Ibnu Rusyd (Averroes)", type: "Tokoh Filsafat", url: "tokoh.html", keywords: ["ibnu rusyd", "averroes", "andalusia", "pembela filsafat", "fasl al-maqal"] },
            { id: "tokoh-6", title: "Suhrawardi", type: "Tokoh Filsafat", url: "tokoh.html", keywords: ["suhrawardi", "iluminasi", "isyraq", "cahaya"] },

            // Kategori: Referensi / Pustaka
            { id: "ref-1", title: "Islam Risalah Cinta & Kebahagiaan", type: "Pustaka Utama", url: "referensi.html", keywords: ["haidar bagir", "cinta", "tasawuf", "buku"] },
            { id: "ref-2", title: "Philosophy in the Islamic World", type: "Pustaka Utama", url: "referensi.html", keywords: ["peter adamson", "sejarah", "tanpa celah", "buku"] },
            { id: "ref-3", title: "Dalil QS. Ali Imran: 190", type: "Ayat Al-Quran", url: "referensi.html", keywords: ["quran", "ali imran", "ulul albab", "dalil"] },
            { id: "ref-4", title: "Dalil QS. Al-Baqarah: 269", type: "Ayat Al-Quran", url: "referensi.html", keywords: ["quran", "baqarah", "hikmah", "dalil"] },

            // Kategori: Lainnya
            { id: "misc-1", title: "Garis Waktu (Timeline)", type: "Navigasi", url: "timeline.html", keywords: ["sejarah", "timeline", "waktu", "era"] },
            { id: "misc-2", title: "Ujian / Kuis Interaktif", type: "Navigasi", url: "kuis.html", keywords: ["kuis", "ujian", "test", "soal"] }
        ];

        this.isOpen = false;
        this.selectedIndex = -1;
        this.currentResults = [];

        // Tunggu DOM selesai untuk injeksi UI
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    init() {
        this.injectCSS();
        this.injectHTML();
        this.cacheDOM();
        this.bindEvents();
        console.log("🔍 [Omni-Search] Mesin pencari diaktifkan. Tekan Ctrl+K.");
    }

    /* ==========================================================
       1. INJEKSI UI (TIDAK PERLU EDIT HTML MANUAL)
       ========================================================== */
    injectCSS() {
        const style = document.createElement('style');
        style.innerHTML = `
            #omni-overlay {
                position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
                z-index: 100000; display: flex; justify-content: center; align-items: flex-start;
                padding-top: 10vh; opacity: 0; visibility: hidden; transition: 0.3s;
            }
            #omni-overlay.active { opacity: 1; visibility: visible; }
            #omni-modal {
                background: var(--bg-surface, #ffffff); width: 100%; max-width: 600px;
                border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                border: 1px solid var(--border-light, rgba(6,78,59,0.1)); overflow: hidden;
                transform: scale(0.95) translateY(-20px); transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            #omni-overlay.active #omni-modal { transform: scale(1) translateY(0); }
            .omni-header { display: flex; align-items: center; padding: 15px 20px; border-bottom: 1px solid var(--border-light, #e2e8f0); gap: 15px; }
            .omni-header i { font-size: 1.2rem; color: var(--clr-primary-500, #10b981); }
            #omni-input { flex: 1; border: none; background: transparent; font-size: 1.1rem; color: var(--text-main, #1e293b); outline: none; }
            .omni-badge { background: var(--bg-body, #f1f5f9); border: 1px solid var(--border-light, #cbd5e1); padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; color: var(--text-muted, #64748b); }
            
            #omni-results { max-height: 400px; overflow-y: auto; padding: 10px; }
            .omni-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; border-radius: 10px; cursor: pointer; transition: 0.2s; margin-bottom: 5px; }
            .omni-item:hover, .omni-item.selected { background: var(--clr-primary-500, #10b981); color: #ffffff; }
            .omni-item:hover .omni-type, .omni-item.selected .omni-type { color: rgba(255,255,255,0.8); }
            .omni-item-title { font-weight: 600; font-size: 0.95rem; }
            .omni-type { font-size: 0.75rem; color: var(--text-muted, #64748b); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .omni-empty { padding: 30px; text-align: center; color: var(--text-muted, #64748b); font-size: 0.9rem; }
            
            /* Dark Mode Support via existing CSS variables */
            [data-theme="dark"] #omni-modal { background: var(--bg-surface, #0f172a); }
            [data-theme="dark"] #omni-input { color: #f8fafc; }
            [data-theme="dark"] .omni-badge { background: #1e293b; color: #94a3b8; border-color: #334155; }
        `;
        document.head.appendChild(style);
    }

    injectHTML() {
        const html = `
            <div id="omni-overlay">
                <div id="omni-modal">
                    <div class="omni-header">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" id="omni-input" placeholder="Cari Tokoh, Tim, atau Referensi..." autocomplete="off">
                        <button id="omni-voice" class="omni-badge" style="cursor:pointer; border:none;" title="Voice Search"><i class="fa-solid fa-microphone"></i></button>
                        <span class="omni-badge">ESC</span>
                    </div>
                    <div id="omni-results">
                        <div class="omni-empty">Ketik sesuatu untuk memulai pencarian...</div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    cacheDOM() {
        this.overlay = document.getElementById('omni-overlay');
        this.input = document.getElementById('omni-input');
        this.resultsBox = document.getElementById('omni-results');
        this.btnVoice = document.getElementById('omni-voice');
    }

    /* ==========================================================
       2. EVENT LISTENERS (KEYBOARD & MOUSE)
       ========================================================== */
    bindEvents() {
        // Toggle (Cmd/Ctrl + K)
        window.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Close on ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });

        // Close on Click Outside
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        // Search Input Logic
        this.input.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Keyboard Navigation (Up, Down, Enter)
        this.input.addEventListener('keydown', (e) => this.handleNavigation(e));

        // Voice Search
        if ('webkitSpeechRecognition' in window) {
            this.btnVoice.addEventListener('click', () => this.startVoiceSearch());
        } else {
            this.btnVoice.style.display = 'none';
        }
    }

    /* ==========================================================
       3. LOGIKA PENCARIAN & RENDERER
       ========================================================== */
    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.overlay.classList.add('active');
        this.input.focus();
        // Reset Search
        this.input.value = '';
        this.handleSearch('');
    }

    close() {
        this.isOpen = false;
        this.overlay.classList.remove('active');
        this.input.blur();
    }

    handleSearch(query) {
        query = query.toLowerCase().trim();
        this.selectedIndex = -1; // Reset selection

        if (query.length === 0) {
            this.currentResults = [];
            this.resultsBox.innerHTML = '<div class="omni-empty"><i class="fa-solid fa-keyboard" style="font-size:2rem; color:var(--border-light); margin-bottom:10px;"></i><br>Ketik nama tokoh, pustaka, atau anggota tim...</div>';
            return;
        }

        // Algoritma Pencarian Sederhana tapi Ampuh
        this.currentResults = this.database.filter(item => {
            const matchTitle = item.title.toLowerCase().includes(query);
            const matchKeyword = item.keywords.some(kw => kw.includes(query));
            return matchTitle || matchKeyword;
        });

        this.renderResults();
    }

    renderResults() {
        if (this.currentResults.length === 0) {
            this.resultsBox.innerHTML = `<div class="omni-empty"><i class="fa-regular fa-face-frown-open" style="font-size:2rem; color:var(--border-light); margin-bottom:10px;"></i><br>Tidak menemukan hasil untuk "<b>${this.input.value}</b>".</div>`;
            return;
        }

        let html = '';
        this.currentResults.forEach((item, index) => {
            // Icon dinamis berdasarkan tipe
            let icon = 'fa-file-lines';
            if(item.type === 'Anggota Tim') icon = 'fa-user-tie';
            if(item.type === 'Tokoh Filsafat') icon = 'fa-book-quran';
            if(item.type === 'Ayat Al-Quran') icon = 'fa-kaaba';

            html += `
                <div class="omni-item" data-index="${index}" onclick="window.location.href='${item.url}'">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <i class="fa-solid ${icon}" style="width:20px; text-align:center;"></i>
                        <span class="omni-item-title">${this.highlightText(item.title, this.input.value)}</span>
                    </div>
                    <span class="omni-type">${item.type}</span>
                </div>
            `;
        });

        this.resultsBox.innerHTML = html;
        this.attachResultListeners();
    }

    highlightText(text, query) {
        // Highlight teks yang dicari dengan span
        const regex = new RegExp(`(${query})`, "gi");
        return text.replace(regex, "<mark style='background:rgba(217, 119, 6, 0.3); color:inherit;'>$1</mark>");
    }

    /* ==========================================================
       4. KEYBOARD NAVIGATION & VOICE SEARCH
       ========================================================== */
    handleNavigation(e) {
        if (this.currentResults.length === 0) return;

        const items = document.querySelectorAll('.omni-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex + 1) % this.currentResults.length;
            this.updateSelection(items);
        } 
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex - 1 + this.currentResults.length) % this.currentResults.length;
            this.updateSelection(items);
        }
        else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.selectedIndex >= 0) {
                window.location.href = this.currentResults[this.selectedIndex].url;
            } else if (this.currentResults.length > 0) {
                // Default ke hasil pertama jika enter ditekan tanpa pilih
                window.location.href = this.currentResults[0].url;
            }
        }
    }

    updateSelection(items) {
        items.forEach(item => item.classList.remove('selected'));
        if (this.selectedIndex >= 0) {
            const activeItem = items[this.selectedIndex];
            activeItem.classList.add('selected');
            // Auto-scroll mengikuti pilihan
            activeItem.scrollIntoView({ block: 'nearest' });
        }
    }

    attachResultListeners() {
        const items = document.querySelectorAll('.omni-item');
        items.forEach(item => {
            item.addEventListener('mouseenter', (e) => {
                this.selectedIndex = parseInt(e.currentTarget.getAttribute('data-index'));
                this.updateSelection(items);
            });
        });
    }

    startVoiceSearch() {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'id-ID';
        
        recognition.onstart = () => {
            this.input.placeholder = "Mendengarkan suara Anda...";
            this.btnVoice.style.color = "#ef4444"; // Merah tanda merekam
            this.btnVoice.classList.add('anim-pulse-glow');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.input.value = transcript;
            this.handleSearch(transcript);
        };

        recognition.onend = () => {
            this.input.placeholder = "Cari Tokoh, Tim, atau Referensi...";
            this.btnVoice.style.color = "var(--text-muted)";
            this.btnVoice.classList.remove('anim-pulse-glow');
        };

        recognition.start();
    }
}

// Inisialisasi Otomatis
const GlobalSearch = new OmniSearchEngine();