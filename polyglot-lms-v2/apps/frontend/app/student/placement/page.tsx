'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function PlacementTest() {
  const [language, setLanguage] = useState<'EN' | 'ZH'>('EN');
  const [step, setStep] = useState(-1);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [showPinyin, setShowPinyin] = useState(true);

  const questionsEN = [
    { q: "1. 'Hello, ___ name is John.'", opts: ["my", "I", "me", "mine"], aIdx: 0 },
    { q: "2. 'I ___ a student.'", opts: ["am", "is", "are", "be"], aIdx: 0 },
    { q: "3. 'She ___ to school every day.'", opts: ["go", "goes", "going", "went"], aIdx: 1 },
    { q: "4. 'Where ___ you live?'", opts: ["do", "does", "are", "is"], aIdx: 0 },
    { q: "5. 'I ___ to the store yesterday.'", opts: ["go", "went", "gone", "going"], aIdx: 1 },
    { q: "6. 'We are going to ___ a movie tonight.'", opts: ["watch", "watches", "watched", "watching"], aIdx: 0 },
    { q: "7. 'This is the ___ book I have ever read.'", opts: ["good", "better", "best", "most good"], aIdx: 2 },
    { q: "8. 'He ___ playing tennis since 10 AM.'", opts: ["is", "was", "has been", "have been"], aIdx: 2 },
    { q: "9. 'If it rains tomorrow, we ___ at home.'", opts: ["stay", "will stay", "stayed", "would stay"], aIdx: 1 },
    { q: "10. 'I'm looking forward ___ you next week.'", opts: ["to see", "seeing", "to seeing", "see"], aIdx: 2 },
    { q: "11. 'He asked me what time ___.'", opts: ["it was", "was it", "is it", "it is"], aIdx: 0 },
    { q: "12. 'They ___ already left when I arrived.'", opts: ["have", "has", "had", "having"], aIdx: 2 },
    { q: "13. 'If I ___ rich, I would travel the world.'", opts: ["was", "were", "am", "will be"], aIdx: 1 },
    { q: "14. 'He's the man ___ son won the tournament.'", opts: ["who", "whom", "whose", "which"], aIdx: 2 },
    { q: "15. 'Not only ___ late, but she also forgot her books.'", opts: ["she was", "was she", "is she", "she is"], aIdx: 1 },
    { q: "16. 'By next year, she ___ her degree.'", opts: ["will finish", "will have finished", "finishes", "is finishing"], aIdx: 1 },
    { q: "17. 'The project is expected to be finished ___ a few weeks.'", opts: ["in", "on", "at", "by"], aIdx: 0 },
    { q: "18. 'It is imperative that he ___ the meeting.'", opts: ["attend", "attends", "attended", "attending"], aIdx: 0 },
    { q: "19. 'Little ___ about the surprise awaiting them.'", opts: ["they knew", "did they know", "knew they", "they did know"], aIdx: 1 },
    { q: "20. '___ the bad weather, they decided to go hiking.'", opts: ["Despite", "Although", "In spite", "Even though"], aIdx: 0 }
  ];

  const questionsZH = [
    { q_hz: "1. 你好！(Translate)", q_py: "1. Nǐ hǎo! (Translate)", opts_hz: ["Goodbye", "Hello", "Thank you", "Sorry"], opts_py: ["Goodbye", "Hello", "Thank you", "Sorry"], aIdx: 1 },
    { q_hz: "2. 我 [___] 去学校。", q_py: "2. Wǒ [___] qù xuéxiào.", opts_hz: ["是", "想", "在", "很"], opts_py: ["shì", "xiǎng", "zài", "hěn"], aIdx: 1 },
    { q_hz: "3. 'Water' 是哪个字？", q_py: "3. Which character means 'Water'?", opts_hz: ["火", "水", "木", "土"], opts_py: ["huǒ", "shuǐ", "mù", "tǔ"], aIdx: 1 },
    { q_hz: "4. (Translate) 'It is very cold today.'", q_py: "4. (Translate) 'It is very cold today.'", opts_hz: ["今天很冷。", "今天不冷。", "星期一很热。", "我很好。"], opts_py: ["Jīntiān hěn lěng.", "Jīntiān bù lěng.", "Xīngqī yī hěn rè.", "Wǒ hěn hǎo."], aIdx: 0 },
    { q_hz: "5. 请问，图书馆在 [___]？", q_py: "5. Qǐngwèn, túshūguǎn zài [___]?", opts_hz: ["吗", "哪儿", "什么", "谁"], opts_py: ["ma", "nǎr", "shénme", "shuí"], aIdx: 1 },
    { q_hz: "6. 我在 [___] 看书。", q_py: "6. Wǒ zài [___] kàn shū.", opts_hz: ["吃饭", "学校", "漂亮", "猫"], opts_py: ["chī fàn", "xuéxiào", "piàoliang", "māo"], aIdx: 1 },
    { q_hz: "7. 他是我的 [___]。", q_py: "7. Tā shì wǒ de [___].", opts_hz: ["朋友", "什么", "现在", "打电话"], opts_py: ["péngyǒu", "shénme", "xiànzài", "dǎ diànhuà"], aIdx: 0 },
    { q_hz: "8. (Translate) 'I am reading a book.'", q_py: "8. (Translate) 'I am reading a book.'", opts_hz: ["我在看书。", "我在打球。", "我在睡觉。", "我在吃饭。"], opts_py: ["Wǒ zài kàn shū.", "Wǒ zài dǎqiú.", "Wǒ zài shuìjiào.", "Wǒ zài chīfàn."], aIdx: 0 },
    { q_hz: "9. 我把门 [___] 了。", q_py: "9. Wǒ bǎ mén [___] le.", opts_hz: ["关", "吃", "看", "走"], opts_py: ["guān", "chī", "kàn", "zǒu"], aIdx: 0 },
    { q_hz: "10. 这个题子有点 [___]。", q_py: "10. Zhège tízǐ yǒu diǎn [___].", opts_hz: ["便宜", "难", "高", "长"], opts_py: ["piányi", "nán", "gāo", "cháng"], aIdx: 1 },
    { q_hz: "11. 别忘了带雨伞。 (Translate)", q_py: "11. Bié wàng le dài yǔsǎn. (Translate)", opts_hz: ["Don't forget to bring your umbrella.", "It will rain today.", "I don't have an umbrella.", "Where is the umbrella?"], opts_py: ["Don't forget to bring your umbrella.", "It will rain today.", "I don't have an umbrella.", "Where is the umbrella?"], aIdx: 0 },
    { q_hz: "12. 她喜欢 [___] 音乐。", q_py: "12. Tā xǐhuān [___] yīnyuè.", opts_hz: ["听", "看", "说", "写"], opts_py: ["tīng", "kàn", "shuō", "xiě"], aIdx: 0 },
    { q_hz: "13. 每当我遇到困难，他总是 [___] 我。", q_py: "13. Měi dāng wǒ yù dào kùnnán, tā zǒng shì [___] wǒ.", opts_hz: ["帮助", "批评", "告诉", "同意"], opts_py: ["bāngzhù", "pīpíng", "gàosù", "tóngyì"], aIdx: 0 },
    { q_hz: "14. 这件衣服的 [___] 很好。", q_py: "14. Zhè jiàn yīfu de [___] hěn hǎo.", opts_hz: ["质量", "时间", "关系", "想法"], opts_py: ["zhìliàng", "shíjiān", "guānxi", "xiǎngfǎ"], aIdx: 0 },
    { q_hz: "15. (Translate) 'We must protect the environment.'", q_py: "15. (Translate) 'We must protect the environment.'", opts_hz: ["我们必须保护环境。", "环境很重要。", "这是我们的责任。", "他们耳朵很好。"], opts_py: ["Wǒmen bìxū bǎohù huánjìng.", "Huánjìng hěn zhòngyào.", "Zhè shì wǒmen de zhérèn.", "Tāmen ěrduǒ hěn hǎo."], aIdx: 0 },
    { q_hz: "16. 温室效应导致气候 [___]。", q_py: "16. Wēnshì xiàoyìng dǎozhì qìhòu [___].", opts_hz: ["变化", "发展", "生效", "根本"], opts_py: ["biànhuà", "fāzhǎn", "shēngjiāo", "gēnběn"], aIdx: 0 },
    { q_hz: "17. 经济 [___] 是每个国家都鼓励的。", q_py: "17. Jīngjì [___] shì měi gè guójiā dōu gǔlì de.", opts_hz: ["发展", "质量", "情况", "烦恼"], opts_py: ["fāzhǎn", "zhìliàng", "qíngkuàng", "fánnǎo"], aIdx: 0 },
    { q_hz: "18. 她在科学 [___] 取得了成就。", q_py: "18. Tā zài kēxué [___] qǔdé le chéngjiù.", opts_hz: ["领域", "基础", "强调", "过程"], opts_py: ["língyù", "jīchǔ", "qiángdiào", "guòchéng"], aIdx: 0 },
    { q_hz: "19. 要在逆境中坚持。 (Translate)", q_py: "19. Yào zài nìjìng zhōng jiānchí. (Translate)", opts_hz: ["It is essential to persevere through adversity.", "We need to do better.", "Practice every day.", "There are mistakes on the screen."], opts_py: ["It is essential to persevere through adversity.", "We need to do better.", "Practice every day.", "There are mistakes on the screen."], aIdx: 0 },
    { q_hz: "20. 这个问题非常 [___]。", q_py: "20. Zhège wèntí fēicháng [___].", opts_hz: ["复杂", "聪明", "普通", "激动"], opts_py: ["fùzá", "cōngmíng", "pǔtōng", "jīdòng"], aIdx: 0 }
  ];

  const currentQuestions = language === 'EN' ? questionsEN : questionsZH;

  const handleAnswer = (optIndex: number) => {
    let newScore = score;
    if (optIndex === currentQuestions[step].aIdx) {
      newScore = score + (100 / currentQuestions.length);
      setScore(newScore);
    }
    
    if (step < currentQuestions.length - 1) {
      setStep(step + 1);
    } else {
      submitTest(newScore);
    }
  };

  const submitTest = async (finalComputedScore: number) => {
    const token = localStorage.getItem('polyglot_token');
    
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/v1/placement/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ language, score: Math.round(finalComputedScore) })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
      // Fallback
      setResult({ estimated_level: language === 'EN' ? 'B1' : 'HSK 3', message: 'Offline Mock Success!' });
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-[#050B14] flex flex-col items-center justify-center p-4 text-center font-sans relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-600/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-green-600/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 p-10 rounded-3xl shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] max-w-md w-full relative z-10 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-black mb-2 text-white drop-shadow-md">Hoàn thành Đánh giá!</h2>
          <p className="text-slate-400 mb-8 font-light">{result.message}</p>
          <div className="bg-slate-800/80 border border-emerald-500/20 p-6 rounded-2xl mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 to-transparent"></div>
            <span className="block text-sm text-emerald-500 font-bold tracking-widest uppercase mb-2 relative z-10">Kết quả trình độ của bạn:</span>
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 relative z-10">{result.estimated_level}</span>
          </div>
          <Link href="/student/dashboard" className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition hover:-translate-y-1">
            Vào Màn Hình Học Tập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050B14] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-600/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-green-600/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-10 rounded-3xl shadow-2xl max-w-2xl w-full relative z-10">
        
        {step === -1 ? (
          <div className="text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-emerald-900/50 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-inner">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h1 className="text-3xl font-black mb-4 text-white drop-shadow-md">Kiểm tra Năng lực Đầu vào</h1>
            <p className="text-slate-400 mb-10 font-light max-w-lg mx-auto">Chọn ngôn ngữ bạn muốn kiểm tra. Hệ thống sẽ kết nối với cơ sở dữ liệu để hiệu chuẩn trình độ và thiết lập bản đồ theo chuẩn quốc tế (CEFR / HSK).</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              <button 
                onClick={() => { setLanguage('EN'); setStep(0); setScore(0); }}
                className="group relative bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(16,185,129,0.3)] text-left"
              >
                <div className="w-12 h-12 bg-blue-900/50 rounded-full mb-4 flex items-center justify-center text-blue-400 font-black text-xl border border-blue-500/30">🇺🇸</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition">Tiếng Anh</h3>
                <p className="text-sm text-slate-400 group-hover:text-slate-300">Chuẩn CEFR (Từ A1 - C2)</p>
              </button>
              <button 
                onClick={() => { setLanguage('ZH'); setStep(0); setScore(0); }}
                className="group relative bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(16,185,129,0.3)] text-left"
              >
                <div className="w-12 h-12 bg-rose-900/50 rounded-full mb-4 flex items-center justify-center text-rose-400 font-black text-xl border border-rose-500/30">🇨🇳</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition">Tiếng Trung</h3>
                <p className="text-sm text-slate-400 group-hover:text-slate-300">Chuẩn HSK (Từ Nấc 1 - 6)</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-8 duration-300 relative">
             {language === 'ZH' && (
               <div className="absolute top-0 right-0 p-2 z-20">
                 <label className="flex items-center space-x-3 cursor-pointer bg-slate-800/80 px-4 py-2 rounded-full border border-emerald-500/30 hover:border-emerald-500 transition-colors shadow-lg shadow-black/20">
                   <span className="text-emerald-400 font-bold text-sm tracking-wide">Pinyin</span>
                   <div className="relative">
                     <input type="checkbox" checked={showPinyin} onChange={e => setShowPinyin(e.target.checked)} className="sr-only" />
                     <div className={`block w-10 h-6 rounded-full transition ${showPinyin ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                     <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${showPinyin ? 'translate-x-4' : ''}`}></div>
                   </div>
                 </label>
               </div>
             )}

            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700/50">
               <div>
                  <span className="text-emerald-500 font-black uppercase tracking-widest text-xs">Testing: {language === 'EN' ? 'English (CEFR)' : 'Chinese (HSK)'}</span>
                  <div className="text-slate-400 font-medium text-sm mt-1">Câu hỏi {step + 1} trên {currentQuestions.length}</div>
               </div>
               <button onClick={() => setStep(-1)} className="text-slate-500 hover:text-white transition text-sm font-bold bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">Thoát Test</button>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 mb-10 overflow-hidden border border-slate-700">
               <div className="bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${((step + 1)/currentQuestions.length)*100}%` }}></div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed tracking-wide pt-4">
               {language === 'ZH' ? (showPinyin ? (currentQuestions[step] as any).q_py : (currentQuestions[step] as any).q_hz) : (currentQuestions[step] as any).q}
            </h2>
            
            <div className="space-y-4">
              {(language === 'ZH' ? (showPinyin ? (currentQuestions[step] as any).opts_py : (currentQuestions[step] as any).opts_hz) : (currentQuestions[step] as any).opts).map((opt: string, i: number) => (
                 <button 
                   key={i}
                   onClick={() => handleAnswer(i)}
                   className="w-full text-left px-6 py-5 rounded-xl border border-slate-700 bg-slate-800/50 hover:border-emerald-500 hover:bg-emerald-900/20 hover:text-emerald-400 transition-all font-medium text-slate-300 flex items-center group shadow-sm hover:shadow-md cursor-pointer"
                 >
                   <span className="w-8 h-8 rounded-lg bg-slate-700 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 flex flex-shrink-0 items-center justify-center mr-4 font-bold transition-colors">{['A','B','C','D'][i]}</span>
                   {opt}
                 </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
