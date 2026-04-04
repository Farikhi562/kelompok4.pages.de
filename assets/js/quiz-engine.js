/**
 * =======================================================================
 * SMART QUIZ ENGINE - KELOMPOK IV AGAMA ISLAM
 * File: quiz-engine.js
 * Deskripsi: Mesin pemroses ujian dengan fitur Anti-Cheat, Auto-Grading,
 * dan Evaluasi Analitik untuk mata kuliah Agama Islam (Filsafat).
 * =======================================================================
 */

class IslamicQuizEngine {
    constructor() {
        // --- KONFIGURASI UJIAN ---
        this.config = {
            timeLimit: 180, // Waktu total dalam detik (3 Menit)
            maxCheats: 3,   // Batas maksimal pindah tab sebelum Auto-Fail
            passingGrade: 70 // Nilai KKM
        };

        // --- STATE MANAJEMEN ---
        this.state = {
            currentQuestion: 0,
            score: 0,
            userAnswers: [],
            timeLeft: this.config.timeLimit,
            cheatCount: 0,
            timerInterval: null,
            isActive: false
        };

        // --- DATABASE SOAL (Materi Filsafat Islam) ---
        this.questions = [
            {
                q: "Siapakah filsuf Muslim yang dijuluki sebagai 'Faylasuf al-Arab' (Filsuf Bangsa Arab) yang pertama kali memadukan filsafat Yunani dan wahyu Islam?",
                options: ["Al-Farabi", "Al-Kindi", "Ibnu Sina", "Al-Ghazali"],
                answer: 1,
                explanation: "Al-Kindi adalah pelopor yang menegaskan bahwa kebenaran rasional (filsafat) tidak bertentangan dengan Al-Quran."
            },
            {
                q: "Dalam buku 'Islam Risalah Cinta dan Kebahagiaan' karya Haidar Bagir, esensi tertinggi beragama bukanlah ketakutan, melainkan...",
                options: ["Syariat yang kaku", "Pencarian kekuasaan", "Cinta (Mahabbah)", "Hafalan teks semata"],
                answer: 2,
                explanation: "Haidar Bagir menggunakan pendekatan tasawuf untuk menunjukkan bahwa Islam berporos pada cinta manusia kepada Sang Pencipta."
            },
            {
                q: "Karya monumental Al-Ghazali yang mengkritik tajam kerancuan pemikiran para filsuf neoplatonik adalah...",
                options: ["Ihya Ulumuddin", "Tahafut al-Falasifah", "Fasl al-Maqal", "Al-Shifa"],
                answer: 1,
                explanation: "Tahafut al-Falasifah (Kerancuan Para Filsuf) ditulis untuk membantah 20 poin pemikiran filsuf yang dianggap menyimpang dari akidah."
            },
            {
                q: "Buku 'Philosophy in the Islamic World' karya Peter Adamson membantah mitos Orientalis dengan membuktikan bahwa...",
                options: ["Filsafat Islam mati setelah Al-Ghazali", "Filsafat Islam berlanjut 'Tanpa Celah' (Without any gaps)", "Filsafat Islam hanya fotokopi Yunani", "Filsafat tidak cocok dengan Islam"],
                answer: 1,
                explanation: "Adamson membuktikan tradisi intelektual terus hidup di madrasah, tradisi Persia (Mulla Sadra), dan India pasca era Klasik."
            },
            {
                q: "Konsep 'Wajib al-Wujud' (Wujud yang Niscaya / Keberadaan-Nya mutlak) digunakan untuk membuktikan eksistensi Tuhan. Konsep ini dipopulerkan oleh...",
                options: ["Ibnu Rusyd", "Suhrawardi", "Ibnu Sina", "Ibnu Khaldun"],
                answer: 2,
                explanation: "Ibnu Sina (Avicenna) merumuskan argumen kosmologis ini yang menjadi standar argumen ketuhanan dalam Kalam dan Filsafat."
            }
        ];

        // Inisialisasi jika berada di halaman Kuis
        if (document.getElementById('quiz-screen')) {
            document.addEventListener('DOMContentLoaded', () => this.init());
        }
    }

    /* ==========================================================
       1. INITIALIZATION & ANTI-CHEAT
       ========================================================== */
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.initAntiCheat();
        console.log("🎓 [Quiz Engine] Siap dieksekusi.");
    }

    cacheDOM() {
        // Screens
        this.startScreen = document.getElementById('start-screen');
        this.quizScreen = document.getElementById('quiz-screen');
        this.resultScreen = document.getElementById('result-screen');
        
        // Quiz Elements
        this.qText = document.getElementById('question-text');
        this.optGrid = document.getElementById('options-grid');
        this.btnNext = document.getElementById('btn-next');
        this.progressBar = document.getElementById('progress-bar');
        this.qTracker = document.getElementById('question-tracker');
        this.timerSpan = document.querySelector('#timer span');
        this.timerIcon = document.getElementById('timer');
    }

    bindEvents() {
        // Mencari tombol mulai (bisa di HTML dengan onclick="QuizApp.startQuiz()" atau querySelector)
        const btnStart = document.querySelector('.btn-start');
        if(btnStart) btnStart.addEventListener('click', () => this.startQuiz());

        if(this.btnNext) this.btnNext.addEventListener('click', () => this.handleNext());
    }

    initAntiCheat() {
        document.addEventListener('visibilitychange', () => {
            if (this.state.isActive && document.hidden) {
                this.state.cheatCount++;
                
                if (window.appToast) {
                    window.appToast(`Peringatan Anti-Cheat (${this.state.cheatCount}/${this.config.maxCheats}): Dilarang buka tab lain!`, 'error');
                } else {
                    alert(`PERINGATAN: Anda meninggalkan halaman ujian! (${this.state.cheatCount}/${this.config.maxCheats})`);
                }

                // AUTO-FAIL LOGIC
                if (this.state.cheatCount >= this.config.maxCheats) {
                    this.state.score = 0; // Hanguskan nilai
                    this.finishQuiz(false, true); // Selesaikan paksa dengan status cheat
                }
            }
        });
    }

    /* ==========================================================
       2. QUIZ FLOW (START, LOAD, NEXT)
       ========================================================== */
    startQuiz() {
        this.startScreen.classList.remove('active');
        this.quizScreen.classList.add('active');
        this.state.isActive = true;
        this.state.userAnswers = new Array(this.questions.length).fill(null);
        
        this.loadQuestion();
        this.startTimer();
    }

    loadQuestion() {
        const qIndex = this.state.currentQuestion;
        const currentQ = this.questions[qIndex];
        
        // Render Teks & Progress
        this.qText.innerHTML = `${qIndex + 1}. ${currentQ.q}`;
        this.qTracker.innerText = `Soal ${qIndex + 1} dari ${this.questions.length}`;
        this.progressBar.style.width = `${((qIndex + 1) / this.questions.length) * 100}%`;
        
        // Render Opsi
        this.optGrid.innerHTML = '';
        this.btnNext.style.display = 'none'; // Sembunyikan tombol next sampai user milih
        this.btnNext.innerHTML = qIndex === this.questions.length - 1 ? 'Selesai <i class="fa-solid fa-flag-checkered"></i>' : 'Selanjutnya <i class="fa-solid fa-arrow-right"></i>';
        
        const labels = ['A', 'B', 'C', 'D'];
        currentQ.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn hover-lift'; // Memakai animasi main.css
            
            // Check if already answered (for navigating back if needed, though here it's linear)
            if(this.state.userAnswers[qIndex] === index) btn.classList.add('selected');

            btn.innerHTML = `<span class="opt-label">${labels[index]}</span> <span class="opt-text">${opt}</span>`;
            btn.onclick = () => this.selectOption(index, btn);
            this.optGrid.appendChild(btn);
        });
    }

    selectOption(index, btnElement) {
        // Hapus kelas selected dari semua opsi
        document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        
        // Tambahkan ke yang dipilih
        btnElement.classList.add('selected');
        
        // Simpan jawaban
        this.state.userAnswers[this.state.currentQuestion] = index;
        
        // Tampilkan tombol Next animasi dari animations.css
        this.btnNext.style.display = 'inline-block';
        this.btnNext.classList.add('anim-fade-up', 'dur-fast');
    }

    handleNext() {
        if (this.state.currentQuestion < this.questions.length - 1) {
            this.state.currentQuestion++;
            this.loadQuestion();
        } else {
            this.finishQuiz();
        }
    }

    /* ==========================================================
       3. TIMER SYSTEM
       ========================================================== */
    startTimer() {
        this.state.timerInterval = setInterval(() => {
            this.state.timeLeft--;
            
            let m = Math.floor(this.state.timeLeft / 60);
            let s = this.state.timeLeft % 60;
            this.timerSpan.innerText = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
            
            // Peringatan visual waktu mau habis
            if(this.state.timeLeft <= 30) {
                this.timerIcon.style.color = '#ef4444'; // Red
                this.timerIcon.classList.add('anim-pulse-glow');
            }
            
            // Waktu habis
            if(this.state.timeLeft <= 0) {
                this.finishQuiz(true); // Selesaikan paksa karena timeout
            }
        }, 1000);
    }

    /* ==========================================================
       4. GRADING & RESULTS
       ========================================================== */
    finishQuiz(isTimeOut = false, isCheatFail = false) {
        clearInterval(this.state.timerInterval);
        this.state.isActive = false;
        
        // Kalkulasi Nilai
        let correctCount = 0;
        this.questions.forEach((q, i) => {
            if(this.state.userAnswers[i] === q.answer) correctCount++;
        });
        
        // Nilai skala 100
        this.state.score = (correctCount / this.questions.length) * 100;
        if (isCheatFail) this.state.score = 0; // Penalti kecurangan

        // UI Transisi
        this.quizScreen.classList.remove('active');
        this.resultScreen.classList.add('active', 'anim-zoom-bounce');

        // Render Hasil
        document.getElementById('score-display').innerText = this.state.score;
        const msgEl = document.getElementById('score-msg');
        
        if (isCheatFail) {
            msgEl.innerHTML = `<span style="color:#ef4444;">DISUALIFIKASI (Terdeteksi Cheating)</span>`;
            if(window.appToast) window.appToast('Ujian dibatalkan karena kecurangan.', 'error');
        } else {
            if (this.state.score >= 90) {
                msgEl.innerHTML = `<span style="color:#10b981;">Mumtaz! (Luar Biasa) 🏆</span>`;
                this.triggerConfetti();
            } else if (this.state.score >= this.config.passingGrade) {
                msgEl.innerHTML = `<span style="color:#047857;">Jayyid! (Lulus Baik) ✅</span>`;
                this.triggerConfetti();
            } else {
                msgEl.innerHTML = `<span style="color:#ef4444;">Rasib (Perlu Remedial) 📚</span>`;
            }
        }

        if(isTimeOut && !isCheatFail) msgEl.innerHTML += `<br><small style="color:#64748b;">(Waktu Habis)</small>`;
        
        this.renderReview();
        this.saveHighestScore();
    }

    renderReview() {
        const reviewBox = document.getElementById('review-box');
        if(!reviewBox) return;

        reviewBox.innerHTML = '<h3 style="margin-bottom:15px; border-bottom:1px dashed var(--border-strong); padding-bottom:10px;"><i class="fa-solid fa-list-check"></i> Evaluasi Pembahasan</h3>';
        
        this.questions.forEach((q, i) => {
            const isCorrect = this.state.userAnswers[i] === q.answer;
            const userAnswerText = this.state.userAnswers[i] !== null ? q.options[this.state.userAnswers[i]] : 'Tidak dijawab';
            const correctAnswerText = q.options[q.answer];
            
            const item = document.createElement('div');
            // Class styling mengandalkan main.css / inline
            item.style.cssText = `
                background: var(--bg-surface); padding: 20px; border-radius: 12px; margin-bottom: 15px; 
                border-left: 5px solid ${isCorrect ? '#10b981' : '#ef4444'};
                box-shadow: var(--shadow-sm);
            `;
            
            item.innerHTML = `
                <div style="font-weight:600; margin-bottom:10px;">${i+1}. ${q.q}</div>
                <div style="font-size:0.9rem; color:${isCorrect ? '#10b981' : '#ef4444'}; margin-bottom:5px;">
                    <strong>Jawaban Anda:</strong> ${userAnswerText} ${isCorrect ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-xmark"></i>'}
                </div>
                ${!isCorrect ? `<div style="font-size:0.9rem; color:var(--clr-primary-700); margin-bottom:5px;"><strong>Kunci Jawaban:</strong> ${correctAnswerText}</div>` : ''}
                <div style="font-size:0.85rem; background:rgba(217, 119, 6, 0.1); padding:10px; border-radius:8px; margin-top:10px; color:var(--text-main);">
                    <i class="fa-solid fa-lightbulb" style="color:#d97706;"></i> <strong>Penjelasan:</strong> ${q.explanation}
                </div>
            `;
            reviewBox.appendChild(item);
        });
    }

    /* ==========================================================
       5. UTILITIES (CONFETTI, LOCAL STORAGE)
       ========================================================== */
    triggerConfetti() {
        // Memastikan library canvas-confetti ada dari CDN di HTML
        if (typeof confetti !== 'undefined') {
            let duration = 3 * 1000;
            let end = Date.now() + duration;

            (function frame() {
                confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#064e3b', '#d97706', '#10b981'] });
                confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#064e3b', '#d97706', '#10b981'] });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
        }
    }

    saveHighestScore() {
        const previousHigh = localStorage.getItem('k4_highest_score') || 0;
        if (this.state.score > previousHigh) {
            localStorage.setItem('k4_highest_score', this.state.score);
            if(window.appToast) window.appToast('Rekor Nilai Tertinggi Baru Disimpan!', 'success');
        }
    }
}

// Inisialisasi Engine Kuis ke Global Window
window.QuizApp = new IslamicQuizEngine();