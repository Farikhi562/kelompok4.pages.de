/**
 * =======================================================================
 * CORE JAVASCRIPT ENGINE - KELOMPOK IV AGAMA ISLAM
 * File: core.js
 * Deskripsi: Sistem pusat untuk mengelola UI/UX Global, Keamanan, 
 * Notifikasi, State Management, dan Interaktivitas di seluruh halaman.
 * =======================================================================
 */

class KelompokEmpatEngine {
    constructor() {
        // Global State
        this.theme = localStorage.getItem('k4_theme') || 'light';
        this.isOnline = navigator.onLine;
        this.easterEggCode = '';
        this.securityViolations = parseInt(localStorage.getItem('k4_violations')) || 0;

        // Jalankan semua mesin saat DOM selesai dimuat
        document.addEventListener('DOMContentLoaded', () => {
            this.bootSystem();
        });
    }

    /**
     * BOOT SEQUENCE: Inisialisasi semua modul secara berurutan
     */
    bootSystem() {
        this.initTheme();
        this.initToastSystem();
        this.initCustomCursor();
        this.initNetworkMonitor();
        this.initSecurityProtocol();
        this.initEasterEgg();
        this.handlePreloader();
        
        // Log keberhasilan ke Console Browser (F12)
        console.log(
            "%c🚀 [K4 ENGINE] All Systems Online. \n%cMata Kuliah Agama Islam - Kelompok IV", 
            "color: #10b981; font-size: 16px; font-weight: bold;",
            "color: #d97706; font-size: 12px; font-style: italic;"
        );
    }

    /**
     * 1. THEME MANAGER: Mengelola Dark/Light Mode tersinkronisasi
     */
    initTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Cari semua tombol dengan ID themeToggle di halaman mana pun
        const themeToggles = document.querySelectorAll('#themeToggle');
        themeToggles.forEach(btn => {
            btn.addEventListener('click', () => {
                this.theme = this.theme === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', this.theme);
                localStorage.setItem('k4_theme', this.theme);
                this.showToast(`Mode ${this.theme === 'dark' ? 'Gelap' : 'Terang'} Diaktifkan`, 'info');
            });
        });
    }

    /**
     * 2. TOAST NOTIFICATION SYSTEM: Membuat kontainer notifikasi dinamis
     */
    initToastSystem() {
        // Buat kontainer jika belum ada di HTML
        if (!document.getElementById('core-toast-container')) {
            const toastContainer = document.createElement('div');
            toastContainer.id = 'core-toast-container';
            Object.assign(toastContainer.style, {
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                zIndex: '100000',
                pointerEvents: 'none'
            });
            document.body.appendChild(toastContainer);
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('core-toast-container');
        const toast = document.createElement('div');
        
        // Styling dasar toast
        Object.assign(toast.style, {
            background: type === 'error' ? '#ef4444' : (type === 'warning' ? '#f59e0b' : '#10b981'),
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '0.9rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transform: 'translateX(120%)',
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s',
            opacity: '0'
        });

        // Icon logic
        let icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-triangle-exclamation';
        if (type === 'info') icon = 'fa-circle-info';

        toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Animate out after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    /**
     * 3. CUSTOM CURSOR: Engine kursor global yang super halus
     */
    initCustomCursor() {
        // Jangan jalankan di perangkat mobile/touch
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

        const dot = document.querySelector('.cursor-dot') || this.createCursorElement('cursor-dot');
        const outline = document.querySelector('.cursor-outline') || this.createCursorElement('cursor-outline');

        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot mengikuti secara instan
            dot.style.left = `${posX}px`;
            dot.style.top = `${posY}px`;

            // Outline mengikuti dengan efek delay (trail) menggunakan Web Animations API
            outline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 400, fill: "forwards" });
        });

        // Efek hover pada elemen yang bisa diklik (a, button)
        document.querySelectorAll('a, button, input, select, .card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                outline.style.transform = 'translate(-50%, -50%) scale(1.5)';
                outline.style.backgroundColor = 'rgba(217, 119, 6, 0.1)';
            });
            el.addEventListener('mouseleave', () => {
                outline.style.transform = 'translate(-50%, -50%) scale(1)';
                outline.style.backgroundColor = 'transparent';
            });
        });
    }

    createCursorElement(className) {
        const el = document.createElement('div');
        el.className = className;
        document.body.appendChild(el);
        return el;
    }

    /**
     * 4. NETWORK MONITOR: Detektor Offline/Online dinamis
     */
    initNetworkMonitor() {
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showToast('Koneksi Internet Terputus! Beralih ke Cache Lokal.', 'error');
        });

        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showToast('Koneksi Stabil Kembali.', 'success');
        });
    }

    /**
     * 5. PRELOADER MANAGER: Menghilangkan layar loading dengan anggun
     */
    handlePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            // Pastikan min loading 1 detik agar animasi Bismillah terlihat
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.transition = 'opacity 0.6s ease';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 600);
            }, 1000);
        }
    }

    /**
     * 6. SECURITY PROTOCOL: Anti-Cheat & Tab Monitoring (Berguna saat kuis)
     */
    initSecurityProtocol() {
        // Cek apakah halaman ini adalah halaman ujian/kuis
        const isQuizPage = window.location.pathname.includes('kuis.html');
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.title = 'Hei! Jangan nyontek ya... 👀';
                if (isQuizPage) {
                    this.securityViolations++;
                    localStorage.setItem('k4_violations', this.securityViolations);
                    console.warn(`[SECURITY] Pindah Tab terdeteksi! Total: ${this.securityViolations}`);
                }
            } else {
                document.title = 'Profil Kelompok IV | Agama Islam';
                if (isQuizPage && this.securityViolations > 0) {
                    this.showToast('Sistem mencatat Anda baru saja meninggalkan tab ujian.', 'warning');
                }
            }
        });
    }

    /**
     * 7. EASTER EGG: Kejutan rahasia untuk Dosen
     */
    initEasterEgg() {
        document.addEventListener('keydown', (e) => {
            this.easterEggCode += e.key.toLowerCase();
            
            // Jika mengetik "bagus"
            if (this.easterEggCode.includes('bagus')) {
                this.showToast('Terima kasih Bapak/Ibu Dosen! Nilai A+ untuk kami ya! 🚀', 'success');
                this.easterEggCode = ''; // reset
            }

            // Batasi panjang string agar tidak memakan memori
            if (this.easterEggCode.length > 10) {
                this.easterEggCode = this.easterEggCode.slice(-10);
            }
        });
    }
}

// =======================================================================
// INSTANSIASI GLOBAL: Mengeksekusi Engine secara otomatis
// =======================================================================
const K4App = new KelompokEmpatEngine();

// Mengekspos fungsi toast agar bisa dipanggil langsung dari file HTML (onclick)
window.appToast = (msg, type) => K4App.showToast(msg, type);