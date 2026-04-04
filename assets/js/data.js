/**
 * =======================================================================
 * GLOBAL DATA & BRANDING INJECTOR - KELOMPOK IV
 * File: data.js
 * Deskripsi: Otomatisasi injeksi Logo Gunadarma & Identitas Kampus 
 * ke seluruh bagian bawah (footer) halaman web.
 * =======================================================================
 */

class GlobalBranding {
    constructor() {
        // Konfigurasi Path Logo & Data Universitas
        this.logoPath = 'assets/images/brand/gunadarma-logo.png';
        this.fallbackLogo = 'https://upload.wikimedia.org/wikipedia/id/thumb/e/e4/Logo_Universitas_Gunadarma.svg/200px-Logo_Universitas_Gunadarma.svg.png'; // Jika gambar lokal belum ada
        this.univName = 'UNIVERSITAS GUNADARMA';
        this.facultyName = 'Fakultas Teknologi Industri • Teknik Informatika';

        // Eksekusi otomatis setelah seluruh elemen HTML dimuat
        document.addEventListener('DOMContentLoaded', () => {
            this.injectGunadarmaBranding();
        });
    }

    injectGunadarmaBranding() {
        // Cari semua tag <footer> di halaman yang sedang dibuka
        const footers = document.querySelectorAll('footer');
        
        if (footers.length === 0) {
            console.warn('[Data.js] Tag <footer> tidak ditemukan di halaman ini.');
            return;
        }

        footers.forEach(footer => {
            // Cegah injeksi ganda jika script terpanggil dua kali
            if (footer.querySelector('.ug-global-branding')) return;

            // Buat kontainer untuk logo dan teks
            const brandingWrapper = document.createElement('div');
            brandingWrapper.className = 'ug-global-branding anim-fade-up'; // Memakai animasi dari animations.css
            
            // Styling langsung via JS agar tidak perlu repot ubah CSS lagi
            Object.assign(brandingWrapper.style, {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px',
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: '1px dashed var(--border-strong, rgba(6, 78, 59, 0.3))',
                width: '100%',
                maxWidth: '600px',
                marginInline: 'auto'
            });

            // HTML Isi dari Branding Gunadarma
            brandingWrapper.innerHTML = `
                <img 
                    src="${this.logoPath}" 
                    alt="Logo Universitas Gunadarma" 
                    title="${this.univName}"
                    onerror="this.src='${this.fallbackLogo}'" 
                    style="height: 60px; width: auto; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15)); transition: transform 0.3s;"
                    onmouseover="this.style.transform='scale(1.1)'"
                    onmouseout="this.style.transform='scale(1)'"
                >
                <div style="text-align: left;">
                    <div style="font-weight: 800; color: var(--clr-primary-700, #047857); font-size: 1.1rem; letter-spacing: 1px;">
                        ${this.univName}
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-muted, #64748b); font-weight: 600;">
                        ${this.facultyName}
                    </div>
                </div>
            `;

            // Suntikkan ke bagian paling bawah dari footer
            footer.appendChild(brandingWrapper);
            
            console.log(`[Data.js] Logo Gunadarma berhasil diinjeksi ke footer!`);
        });
    }
}

// Jalankan sistem
new GlobalBranding();