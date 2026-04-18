// app.js - Main Application Controller for Polyglot Mindmap

const App = {
  currentLevel: 1,
  currentMode: 'mindmap',
  currentCategory: null,
  currentWordIndex: 0,
  studyQueue: [],
  masteredWords: new Set(),
  srsData: {},
  userId: 'default-user-id',
  primaryLang: 'en',
  showPhonetics: true,

  data: {},

  init() {
    this.bindEvents();
    // Data loading is deferred to App.login()!
  },

  async login() {
    const un = document.getElementById('login-username').value.trim();
    if (!un) return alert("Hãy nhập một định danh học tập!");
    try {
      const res = await fetch('http://localhost:3000/api/users/auth', {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({username: un})
      });
      const user = await res.json();
      this.userId = user.id;
      
      const pRes = await fetch(`http://localhost:3000/api/progress/${this.userId}`);
      const srsList = await pRes.json();
      srsList.forEach(r => { this.srsData[r.vocab_id] = r; if(r.interval>0) this.masteredWords.add(r.vocab_id); });
      
      document.getElementById('login-modal').classList.remove('force-show');
      document.getElementById('login-modal').style.display = 'none';
      
      await this.selectLevel(1);
      this.selectMode('mindmap');
      this.updateStats();
    } catch(e) {
      alert("❌ Máy chủ API Backend (`node server.js`) chưa được khởi chạy. Vui lòng bật Terminal gõ lệnh để chạy hệ thống CSDL!");
      console.warn("DB not connected", e);
    }
  },

  async addWord() {
     const w = {
       level: document.getElementById('aw-level').value,
       category: document.getElementById('aw-cat').value || 'User Custom',
       category_vi: document.getElementById('aw-cat').value || 'Từ tự thêm',
       en_word: document.getElementById('aw-en').value,
       vi_meaning: document.getElementById('aw-vi').value,
       zh_hanzi: document.getElementById('aw-zh').value,
       zh_pinyin: document.getElementById('aw-zp').value,
       en_phonetic: '', examples: []
     };
     if (!w.en_word || !w.vi_meaning || !w.zh_hanzi) return alert("⚠️ Vui lòng điền tối thiểu 3 mặt chữ: English, Việt và Chữ Hán!");
     
     try {
       const res = await fetch('http://localhost:3000/api/vocab/add', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(w)
       });
       if (res.ok) {
          alert("✅ Đã ghi từ vựng vào CSDL thành công!");
          document.getElementById('add-word-modal').classList.remove('show');
          this.data[w.level] = null; // Invalidate cache
          this.selectLevel(parseInt(w.level)); // Render update
       }
     } catch(e) { alert("Lỗi kết nối CSDL!"); }
  },

  bindEvents() {
    document.querySelectorAll('.level-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectLevel(parseInt(btn.dataset.level));
        if (window.innerWidth <= 768) this.toggleSidebar(false);
      });
    });
    document.querySelectorAll('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => this.selectMode(tab.dataset.mode));
    });
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) menuToggle.addEventListener('click', () => this.toggleSidebar(true));
  },

  toggleSidebar(show) {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
      if (show) { sidebar.classList.add('active'); overlay.classList.add('active'); }
      else { sidebar.classList.remove('active'); overlay.classList.remove('active'); }
    }
  },

  async selectLevel(level) {
    this.currentLevel = level;
    this.currentCategory = null;
    document.querySelectorAll('.level-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.level) === level);
    });
    const levelColors = { 0: '#FFC107', 1: '#4CAF50', 2: '#2196F3', 3: '#9C27B0', 4: '#FF9800', 5: '#E91E63', 6: '#F44336' };
    document.documentElement.style.setProperty('--accent-color', levelColors[level]);
    
    if (!this.data[level]) {
        document.getElementById('mindmap-container').innerHTML = '<p class="no-data">Đang tải dữ liệu từ CSDL API...</p>';
        try {
           const res = await fetch(`http://localhost:3000/api/vocab?level=${level}`);
           this.data[level] = await res.json();
        } catch(e) {
           console.error("Fetch API error", e);
        }
    }
    
    this.renderCurrentMode();
    this.updateStats();
  },

  selectMode(mode) {
    this.currentMode = mode;
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    document.querySelectorAll('.mode-panel').forEach(p => p.style.display = p.id === `panel-${mode}` ? 'block' : 'none');
    this.renderCurrentMode();
  },

  renderCurrentMode() {
    if (this.currentMode === 'mindmap') MindMap.render(this.currentLevel);
    if (this.currentMode === 'flashcard') FlashCard.init(this.currentLevel, this.currentCategory);
    if (this.currentMode === 'browse') Browse.render(this.currentLevel);
    if (this.currentMode === 'quiz') Quiz.init();
  },

  getAllWords(level) {
    const d = this.data[level];
    if (!d) return [];
    return d.categories.flatMap(cat =>
      cat.words.map(w => ({ ...w, category: cat.name, category_vi: cat.name_vi, hsk_level: level }))
    );
  },

  markMastered(wordId) {
    this.masteredWords.add(wordId);
    this.updateStats();
  },

  updateSRS(wordId, rating) {
    let data = this.srsData[wordId] || { interval: 0, ease: 2.5, next_review: Date.now() };
    if (rating === 'easy') {
      data.interval = data.interval === 0 ? 1 : data.interval * data.ease;
      data.next_review = Date.now() + Math.round(data.interval * 86400000);
      this.masteredWords.add(wordId);
    } else {
      data.interval = 0;
      data.ease = Math.max(1.3, data.ease - 0.2);
      data.next_review = Date.now();
    }
    this.srsData[wordId] = data;
    
    fetch('http://localhost:3000/api/progress', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
          user_id: this.userId, vocab_id: wordId, 
          interval: data.interval, ease: data.ease, next_review: data.next_review
       })
    }).catch(e => console.warn('DB Sync Fail', e));

    this.updateStats();
  },

  updateStats() {
    const all = this.getAllWords(this.currentLevel);
    const total = all.length;
    const mastered = all.filter(w => this.masteredWords.has(w.id)).length;
    const pct = total > 0 ? Math.round(mastered / total * 100) : 0;
    const el = document.getElementById('progress-text');
    const bar = document.getElementById('progress-bar');
    if (el) el.textContent = `Lvl${this.currentLevel}: ${mastered}/${total} words (${pct}%) SRS Active`;
    if (bar) bar.style.width = pct + '%';
  },

  handleSearch(query) {
    // Basic search implementation
    if (!query.trim()) { this.renderCurrentMode(); return; }
    const q = query.toLowerCase();
    const results = this.getAllWords(1).filter(w => 
      w.en.word.toLowerCase().includes(q) || w.zh.hanzi.includes(q) || w.vi_meaning.toLowerCase().includes(q)
    );
    Browse.renderResults(results, query);
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.mode-panel').forEach(p => p.classList.remove('active'));
    document.querySelector('[data-mode="browse"]')?.classList.add('active');
    document.getElementById('panel-browse').classList.add('active');
  }
};

const MindMap = {
  expanded: new Set(),
  render(level) {
    const container = document.getElementById('mindmap-container');
    const data = App.data[level];
    if (!data) { container.innerHTML = '<p class="no-data">Loading trilingual data...</p>'; return; }

    let html = `<div class="mindmap-root">
      <div class="mindmap-center" style="background: var(--accent-color)">
        <span class="mindmap-level-label">Lvl ${level}</span>
        <span class="mindmap-total">${data.total} words</span>
      </div>
      <div class="mindmap-branches">`;
    data.categories.forEach((cat, i) => {
      const isExp = this.expanded.has(`${level}-${i}`);
      html += `
        <div class="mindmap-branch ${isExp ? 'expanded' : ''}">
          <div class="mindmap-node category-node" onclick="MindMap.toggleCategory(${level}, ${i})" style="--idx:${i}">
            <span class="node-icon">${cat.icon}</span>
            <span class="node-name">${cat.name_vi}</span>
            <span class="node-count">${cat.words.length}</span>
            <span class="node-toggle">${isExp ? '▲' : '▼'}</span>
          </div>
          <div class="word-cloud ${isExp ? 'show' : ''}">
            ${cat.words.map(w => {
              const isMastered = App.masteredWords.has(w.id);
              const safeEn = w.en.word.replace(/'/g, "\\'").replace(/"/g, '&quot;');
              return `<div class="word-chip ${isMastered ? 'mastered' : ''}" style="padding:10px; min-width: 100px"
                   onclick="WordModal.show(${w.id})">
                <span style="font-weight:700; font-size:1.1rem; color:var(--accent-color)">${w.en.word}</span>
                <span class="chip-hanzi" style="font-size:1.3rem;">${w.zh.hanzi}</span>
                <span style="font-size:0.75rem; color:var(--text-dim)">${w.vi_meaning}</span>
              </div>`
            }).join('')}
          </div>
        </div>`;
    });
    html += `</div></div>`;
    container.innerHTML = html;
  },
  toggleCategory(level, idx) {
    const key = `${level}-${idx}`;
    if (this.expanded.has(key)) this.expanded.delete(key); else this.expanded.add(key);
    this.render(level);
  }
};

const FlashCard = {
  queue: [], currentIdx: 0, isFlipped: false, mode: 'en',
  init(level, category) {
    let words = App.getAllWords(level);
    if (category) words = words.filter(w => w.category === category);
    
    // SRS Logic: Interleave Due reviews and Unseen words, randomize within tiers
    const now = Date.now();
    this.queue = words.sort((a,b) => {
       const srsA = App.srsData[a.id] ? App.srsData[a.id].next_review : 0;
       const srsB = App.srsData[b.id] ? App.srsData[b.id].next_review : 0;
       const isDueA = srsA <= now;
       const isDueB = srsB <= now;
       if (isDueA && !isDueB) return -1;
       if (!isDueA && isDueB) return 1;
       return srsA - srsB || Math.random() - 0.5;
    });
    
    this.currentIdx = 0; this.isFlipped = false;
    this.render();
  },
  render() {
    const container = document.getElementById('flashcard-container');
    if (!container || !this.queue.length) { if(container) container.innerHTML = '<p>No data</p>'; return; }
    const word = this.queue[this.currentIdx];
    const pct = ((this.currentIdx + 1) / this.queue.length * 100).toFixed(0);
    container.innerHTML = `
      <div class="fc-header">
        <div class="fc-progress-bar"><div class="fc-progress-fill" style="width:${pct}%"></div></div>
        <div class="fc-counter">${this.currentIdx + 1}/${this.queue.length}</div>
        <div class="fc-mode-toggle">
          <button class="fc-mode-btn ${this.mode === 'en' ? 'active' : ''}" onclick="FlashCard.setMode('en')">EN Front</button>
          <button class="fc-mode-btn ${this.mode === 'zh' ? 'active' : ''}" onclick="FlashCard.setMode('zh')">ZH Front</button>
          <button class="fc-mode-btn ${this.mode === 'vi' ? 'active' : ''}" onclick="FlashCard.setMode('vi')">VI Front</button>
        </div>
      </div>
      <div class="flashcard ${this.isFlipped ? 'flipped' : ''}" onclick="FlashCard.flip()">
        <div class="card-inner">
          <div class="card-front">${this.getFront(word)}</div>
          <div class="card-back">${this.getBack(word)}</div>
        </div>
      </div>
      <div class="fc-actions ${this.isFlipped ? 'show' : ''}">
        <button class="fc-btn again" onclick="FlashCard.answer('again')">🔄 Quên (Học lại)</button>
        <button class="fc-btn easy" onclick="FlashCard.answer('easy')">✅ Nhớ (Tăng lịch SRS)</button>
      </div>`;
  },
  getFront(w) {
    const safeEn = w.en.word.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const safeZh = w.zh.hanzi.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    if (this.mode === 'en') return `<div style="font-size:3rem; font-weight:700" onclick="event.stopPropagation(); Speech.speak('${safeEn}', 'en-US')">${w.en.word} 🔊</div><div class="card-pos">${w.en.phonetic}</div>`;
    if (this.mode === 'zh') return `<div class="card-hanzi" style="font-size:4rem" onclick="event.stopPropagation(); Speech.speak('${safeZh}', 'zh-CN')">${w.zh.hanzi} 🔊</div>`;
    return `<div class="card-meaning" style="font-size:2.5rem">${w.vi_meaning}</div>`;
  },
  getBack(w) {
    const safeEn = w.en.word.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const safeZh = w.zh.hanzi.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    let html = '<div class="card-back-content" style="text-align:center">';
    if (this.mode !== 'en') html += `<div style="font-size:2.5rem; font-weight:bold; color:var(--accent-color)" onclick="event.stopPropagation(); Speech.speak('${safeEn}', 'en-US')">${w.en.word} 🔊</div>`;
    if (this.mode !== 'zh') html += `<div style="font-size:3rem; font-family:var(--font-hanzi)" onclick="event.stopPropagation(); Speech.speak('${safeZh}', 'zh-CN')">${w.zh.hanzi} <span style="font-size:1.2rem">(${w.zh.pinyin})</span> 🔊</div>`;
    if (this.mode !== 'vi') html += `<div style="font-size:1.8rem; margin-top:10px">${w.vi_meaning}</div>`;
    html += '<hr style="border-color:var(--border); margin:15px 0">';
    if (w.examples && w.examples[0]) {
       html += `<div style="font-size:0.95rem; text-align:left; background:var(--surface2); padding:10px; border-radius:8px">
            <i>${w.examples[0].en}</i><br>
            <i style="color:var(--text-dim); font-family:var(--font-hanzi)">${w.examples[0].zh}</i><br>
            <i style="color:var(--text-faint)">${w.examples[0].vi}</i>
          </div>`;
    }
    html += '</div>';
    return html;
  },
  flip() { this.isFlipped = !this.isFlipped; this.render(); },
  setMode(mode) { this.mode = mode; this.isFlipped = false; this.render(); },
  answer(rating) {
    App.updateSRS(this.queue[this.currentIdx].id, rating);
    if (rating === 'again') this.queue.push(this.queue.splice(this.currentIdx, 1)[0]);
    else this.currentIdx++;
    if (this.currentIdx >= this.queue.length) {
       document.getElementById('flashcard-container').innerHTML = '<div style="text-align:center; padding:50px"><h3>🎉 Đã xong lượt ôn tập! Khởi động lại Flashcards để ôn tiếp.</h3></div>';
       return;
    }
    this.isFlipped = false; this.render();
  }
};

const Quiz = {
  questions: [], currentIdx: 0, score: 0, mode: 'standard',
  init() { this.showSection('setup'); },
  showSection(id) { ['setup', 'game', 'result'].forEach(s => { const el=document.getElementById(`quiz-${s}`); if(el) el.classList.toggle('hidden', s!==id); }); },
  start() {
    const modalSel = document.querySelector('input[name="quiz_mode"]:checked');
    this.mode = modalSel ? modalSel.value : 'standard';
    const all = App.getAllWords(App.currentLevel);
    this.questions = this.generateQuestions(all, 15);
    this.currentIdx = 0; this.score = 0;
    this.showSection('game'); this.renderQuestion();
  },
  generateQuestions(pool, count) {
    return pool.sort(()=>0.5-Math.random()).slice(0,count).map(w => {
      // 0: EN -> ZH, 1: EN -> VI, 2: ZH -> EN, 3: ZH -> VI, 4: VI -> EN, 5: VI -> ZH
      const type = Math.floor(Math.random() * 6);
      const alts = pool.filter(x => x.en.word !== w.en.word).sort(()=>0.5-Math.random()).slice(0,3);
      let q, a, opts, lang;
      
      switch(type) {
        case 0: q = w.en.word; a = w.zh.hanzi; opts = [w.zh.hanzi, ...alts.map(x=>x.zh.hanzi)]; lang = 'en-US'; break;
        case 1: q = w.en.word; a = w.vi_meaning; opts = [w.vi_meaning, ...alts.map(x=>x.vi_meaning)]; lang = 'en-US'; break;
        case 2: q = w.zh.hanzi; a = w.en.word; opts = [w.en.word, ...alts.map(x=>x.en.word)]; lang = 'zh-CN'; break;
        case 3: q = w.zh.hanzi; a = w.vi_meaning; opts = [w.vi_meaning, ...alts.map(x=>x.vi_meaning)]; lang = 'zh-CN'; break;
        case 4: q = w.vi_meaning; a = w.en.word; opts = [w.en.word, ...alts.map(x=>x.en.word)]; lang = ''; break;
        case 5: q = w.vi_meaning; a = w.zh.hanzi; opts = [w.zh.hanzi, ...alts.map(x=>x.zh.hanzi)]; lang = ''; break;
      }
      return { q, a, opts: opts.sort(()=>0.5-Math.random()), lang };
    });
  },
  renderQuestion() {
    const q = this.questions[this.currentIdx];
    document.getElementById('quiz-stats').textContent = `Q: ${this.currentIdx+1}/${this.questions.length} | Mode: ${this.mode.toUpperCase()} | Score: ${this.score}`;
    
    let qHtml;
    if (this.mode === 'listening') {
       qHtml = `<div style="font-size:3rem; font-weight:bold; cursor:pointer; color:var(--accent-color)" onclick="Speech.speak('${q.q.replace(/'/g, "\\'")}', '${q.lang}')">🎧 Nhấn phát Audio</div>`;
       setTimeout(() => Speech.speak(q.q, q.lang), 500);
    } else {
       qHtml = `<div style="font-size:2rem; font-weight:bold">${q.q}</div>`;
       if (q.lang) qHtml += ` <span style="cursor:pointer; font-size:1.5rem" onclick="Speech.speak('${q.q.replace(/'/g, "\\'")}', '${q.lang}')">🔊</span>`;
    }
    document.getElementById('quiz-question-box').innerHTML = qHtml;
    
    if (this.mode === 'typing') {
       document.getElementById('quiz-options').innerHTML = `
         <input type="text" id="quiz-type-input" placeholder="Nhập đáp án viết tay của bạn..." autocomplete="off" 
                style="width:100%; padding:15px; font-size:1.2rem; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:#fff; text-align:center">
         <button class="primary-btn" style="margin-top:15px; width:100%; padding:15px; font-size:1.2rem" onclick="Quiz.check(document.getElementById('quiz-type-input').value)">Kiểm tra</button>
       `;
       setTimeout(() => document.getElementById('quiz-type-input').focus(), 100);
    } else {
       document.getElementById('quiz-options').innerHTML = q.opts.map(o => `<div class="quiz-option" onclick="Quiz.check('${o.replace(/'/g, "\\'")}')">${o}</div>`).join('');
    }
    
    document.getElementById('quiz-feedback').innerHTML = '';
  },
  check(choice) {
    const q = this.questions[this.currentIdx];
    if (this.mode === 'typing' && !choice.trim()) return;
    
    const isCorrect = this.mode === 'typing' ? (choice.trim().toLowerCase() === q.a.toLowerCase()) : (choice === q.a);
    if (isCorrect) this.score++;
    document.getElementById('quiz-feedback').innerHTML = isCorrect ? '<span style="color:#4CAF50">✅ Rất chuẩn xác!</span>' : `<span style="color:#f44336">❌ Chưa chính xác! Đáp án đúng: ${q.a}</span>`;
    setTimeout(() => {
      this.currentIdx++;
      if (this.currentIdx < this.questions.length) this.renderQuestion();
      else { this.showSection('result'); document.getElementById('result-score').textContent = `${this.score}/${this.questions.length}`; }
    }, 1500);
  },
  restart() { this.start(); }
};

const Browse = {
  render(level) {
    const data = App.data[level];
    if (!data) return;
    let html = `<div class="browse-header"><h3>Lvl${level} — Trilingual Browse</h3></div>`;
    data.categories.forEach(cat => {
      html += `<div><h4>${cat.icon} ${cat.name} / ${cat.name_vi}</h4><div style="display:grid; gap:10px; margin-bottom: 20px;">`;
      cat.words.forEach(w => {
        const safeEn = w.en.word.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        html += `<div style="background:var(--surface); padding:15px; border-radius:8px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="WordModal.show(${w.id})">
          <div style="width:30%">
            <div style="font-weight:bold; font-size:1.1rem">${w.en.word}</div>
            <div style="color:var(--text-dim); font-size:0.8rem">${w.en.phonetic}</div>
          </div>
          <div style="width:30%; font-family:var(--font-hanzi)">
            <div style="font-weight:bold; font-size:1.2rem">${w.zh.hanzi}</div>
            <div style="color:var(--text-dim); font-size:0.8rem">${w.zh.pinyin}</div>
          </div>
          <div style="width:30%; text-align:right">${w.vi_meaning}</div>
        </div>`;
      });
      html += `</div></div>`;
    });
    document.getElementById('panel-browse').innerHTML = html;
  },
  renderResults(results, query) {
    const html = `<h3>Search: "${query}"</h3>` + results.map(w => {
      const safeEn = w.en.word.replace(/'/g, "\\'").replace(/"/g, '&quot;');
      return `<div style="padding:10px; background:var(--surface); margin-bottom:10px;" onclick="WordModal.show(${w.id})">${w.en.word} - ${w.zh.hanzi} - ${w.vi_meaning}</div>`;
    }).join('');
    document.getElementById('panel-browse').innerHTML = html;
  }
};

const WordModal = {
  show(id) {
    const word = App.getAllWords(App.currentLevel).find(w => w.id === id);
    if (!word) return;
    const isMastered = App.masteredWords.has(word.id);
    const content = document.getElementById('modal-content');
    
    // Polyglot UI Side-By-Side Layout
    const safeEn = word.en.word.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const safeZh = word.zh.hanzi.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    content.innerHTML = `
      <div style="display:flex; gap:20px; border-bottom:1px solid var(--border); padding-bottom:15px; margin-bottom:15px;">
        <div style="flex:1; text-align:center">
          <div style="font-size:2rem; font-weight:bold; cursor:pointer" onclick="Speech.speak('${safeEn}', 'en-US')">🇬🇧 ${word.en.word} 🔊</div>
          <div style="color:var(--text-dim)">${word.en.phonetic}</div>
          <div style="margin-top:10px;"><button class="fc-btn" style="padding:5px 10px; font-size:0.8rem; background:var(--surface2); border:1px solid var(--border); color:#fff" onclick="SpeechTest.start('${safeEn}', 'en-US', 'vt-en')">🎙️ Luyện Đọc</button></div>
          <div id="vt-en" style="font-size:0.8rem; margin-top:5px; color:var(--text-dim)"></div>
        </div>
        <div style="flex:1; text-align:center; border-left:1px solid var(--border); border-right:1px solid var(--border);">
          <div style="font-size:2.5rem; font-family:var(--font-hanzi); font-weight:bold; cursor:pointer" onclick="Speech.speak('${safeZh}', 'zh-CN')">🇨🇳 ${word.zh.hanzi} 🔊</div>
          <div style="color:var(--text-dim)">${word.zh.pinyin}</div>
          <div style="margin-top:10px;"><button class="fc-btn" style="padding:5px 10px; font-size:0.8rem; background:var(--surface2); border:1px solid var(--border); color:#fff" onclick="SpeechTest.start('${safeZh}', 'zh-CN', 'vt-zh')">🎙️ Luyện Đọc</button></div>
          <div id="vt-zh" style="font-size:0.8rem; margin-top:5px; color:var(--text-dim)"></div>
        </div>
        <div style="flex:1; text-align:center; display:flex; align-items:center; justify-content:center; font-size:1.2rem; font-weight:bold;">
          🇻🇳 ${word.vi_meaning}
        </div>
      </div>
      
      <div style="background:var(--surface2); padding:5px 10px; border-radius:5px; margin-bottom:15px; display:inline-block; font-size:0.85rem">POS: ${word.pos}</div>
      
      ${word.examples && word.examples.length ? `
      <div>
        <h4>💼 Context: ${word.examples[0].context}</h4>
        <div style="background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:15px; margin-top:10px;">
          <div style="margin-bottom:15px; cursor:pointer" onclick="Speech.speak('${word.examples[0].en.replace(/'/g, "\\'")}', 'en-US')">
            <strong>EN:</strong> ${word.examples[0].en} 🔊<br>
            <span style="color:var(--text-dim); font-size:0.85rem">${word.examples[0].en_p}</span>
          </div>
          <div style="margin-bottom:15px; cursor:pointer" onclick="Speech.speak('${word.examples[0].zh}', 'zh-CN')">
            <strong style="font-family:var(--font-hanzi)">ZH:</strong> <span style="font-family:var(--font-hanzi)">${word.examples[0].zh}</span> 🔊<br>
            <span style="color:var(--text-dim); font-size:0.85rem">${word.examples[0].zh_p}</span>
          </div>
          <div>
            <strong>VI:</strong> ${word.examples[0].vi}
          </div>
        </div>
      </div>
      ` : ''}

      <div style="margin-top:20px; display:flex; gap:10px">
        <button class="fc-btn" style="flex:1; background:var(--surface); border:1px solid var(--border); color:#fff" onclick="WordModal.toggle(${word.id})">
          ${isMastered ? 'Undo Mastery' : '✅ Mark Mastered'}
        </button>
      </div>
    `;
    document.getElementById('word-modal').classList.add('show');
  },
  toggle(wordId) {
    if (App.masteredWords.has(wordId)) App.masteredWords.delete(wordId);
    else App.markMastered(wordId);
    localStorage.setItem('polyglot_mastered', JSON.stringify([...App.masteredWords]));
    App.updateStats();
    document.getElementById('word-modal').classList.remove('show');
    MindMap.render(App.currentLevel);
  },
  close() { document.getElementById('word-modal').classList.remove('show'); }
};

const Speech = {
  speak(text, lang) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

const SpeechTest = {
  recognition: null,
  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  },
  start(targetText, lang, elId) {
    if (!this.recognition) { alert('Browser not supported for voice recognition.'); return; }
    const statusEl = document.getElementById(elId);
    if (statusEl) statusEl.innerHTML = "🎙️ Đang nghe...";
    this.recognition.lang = lang;
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      const target = targetText.trim().toLowerCase();
      // Remove punctuation for comparison
      const cleanT = transcript.replace(/[.,!?。，！？]/g, '');
      const cleanTarget = target.replace(/[.,!?。，！？]/g, '');
      if (cleanT === cleanTarget || cleanTarget.includes(cleanT) || cleanT.includes(cleanTarget)) {
        if (statusEl) statusEl.innerHTML = `✅ Chuẩn! (${transcript})`;
      } else {
        if (statusEl) statusEl.innerHTML = `❌ Sai (${transcript})`;
      }
    };
    this.recognition.onerror = () => {
      if (statusEl) statusEl.innerHTML = '⚠️ Không nhận diện được';
    };
    this.recognition.start();
  }
};

window.addEventListener('DOMContentLoaded', () => { App.init(); SpeechTest.init(); });
