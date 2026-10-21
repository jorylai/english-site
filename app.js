const $=s=>document.querySelector(s),el=(t,h,c)=>{const e=document.createElement(t);if(h!=null)e.innerHTML=h;if(c)e.className=c;return e};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let D,sents=[],rate=LS.get('rate',0.9);
const words=s=>s.toLowerCase().replace(/[^a-z0-9%.$' -]/g,' ').replace(/\.(?!\d)/g,' ').split(/\s+/).filter(Boolean);
function voice(){const v=speechSynthesis.getVoices().filter(v=>/^en[-_]US/i.test(v.lang));return v.find(x=>/Google|Samantha|Natural/.test(x.name))||v[0]}
function say(t,onend){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.rate=rate;const v=voice();if(v)u.voice=v;if(onend)u.onend=onend;speechSynthesis.speak(u);return u}
function split(t){return t.match(/[^.!?]+(?:[.!?](?!\d)|$)["”]?/g).map(s=>s.trim()).filter(Boolean)}
function diff(ref,hyp){const a=words(ref),b=words(hyp),n=a.length,m=b.length,L=[...Array(n+1)].map(()=>Array(m+1).fill(0));
 for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)L[i][j]=a[i]===b[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
 let i=0,j=0,o=[];while(i<n||j<m){if(i<n&&j<m&&a[i]===b[j]){o.push(`<span class=ok>${esc(a[i])}</span>`);i++;j++}else if(j<m&&(i>=n||L[i][j+1]>=L[i+1][j])){o.push(`<span class=bad>${esc(b[j])}</span>`);j++}else{o.push(`<span class=miss>[${esc(a[i])}]</span>`);i++}}
 return `<p>${o.join(' ')}</p><p>准确率 <b>${n?Math.round(L[0][0]/n*100):0}%</b> <span class=muted>绿=对 红=多/错 橙=漏</span></p>`}
function qa(box,qs){box.innerHTML='';qs.forEach((x,i)=>{const d=el('div',`<b>${i+1}.</b> ${esc(x.q)} <button class=s>显示答案</button><div class="ans hidden">${esc(x.a)}</div>`,'q');d.querySelector('button').onclick=e=>{d.querySelector('.ans').classList.toggle('hidden')};box.append(d)})}
function record(onDone,btn){if(!SR){alert('此浏览器不支持语音识别，请用 Chrome/Edge（或直接用 AI 语音对话练习）');return null}
 const r=new SR();r.lang='en-US';r.continuous=true;r.interimResults=true;let fin='',t0=Date.now();
 r.onresult=e=>{let s='';fin='';for(const x of e.results)(x.isFinal?fin+=x[0].transcript+' ':s+=x[0].transcript);onDone(fin+s,(Date.now()-t0)/1000,false)};
 r.onerror=e=>onDone('（识别出错：'+e.error+'）',0,true);r.onend=()=>{if(btn)btn.textContent=btn.dataset.l;onDone(fin,(Date.now()-t0)/1000,true)};r.start();if(btn){btn.dataset.l=btn.textContent;btn.textContent='⏹ 停止录音'}return r}
const doneKey=()=>'done-'+D.date;
function progress(){const p=LS.get(doneKey(),{}),box=$('#progress');box.innerHTML='今日进度：';[['listen','听'],['speak','说'],['read','读'],['write','写']].forEach(([k,n])=>{const l=el('label',`<input type=checkbox ${p[k]?'checked':''}> ${n}`);l.querySelector('input').onchange=e=>{p[k]=e.target.checked;LS.set(doneKey(),p);streak()};box.append(l)});streak()}
function streak(){let d=new Date(),n=0;const f=x=>x.toISOString().slice(0,10),any=k=>Object.values(LS.get('done-'+k,{})).some(Boolean);if(!any(f(d)))d.setDate(d.getDate()-1);while(any(f(d))){n++;d.setDate(d.getDate()-1)}$('#streak').textContent='🔥 连续 '+n+' 天'}
function render(){$('#lvl').textContent=D.level||'';$('#note').textContent=D.note||'';progress();
 const L=D.listen;$('#lt').textContent=L.title;sents=split(L.text);$('#sents').innerHTML=sents.map(s=>`<li>${esc(s)}</li>`).join('');
 $('#shadow').innerHTML='';$('#dictSel').innerHTML='<option value=-1>整段</option>'+sents.map((s,i)=>`<option value=${i}>第 ${i+1} 句</option>`).join('');
 sents.forEach((s,i)=>{const li=el('li',`<button class=s>▶</button><button class=s>🎤</button> <span class="st muted">第 ${i+1} 句（${words(s).length} 词）</span><span class="tx hidden"> ${esc(s)}</span><div class=out></div>`);
  const[b1,b2]=li.querySelectorAll('button');b1.onclick=()=>say(s);let r;b2.onclick=()=>{if(r){r.stop();r=null;return}r=record((t,_,fin)=>{li.querySelector('.out').innerHTML=fin?diff(s,t):'<i>'+esc(t)+'</i>';if(fin)r=null},b2)};$('#shadow').append(li)});
 qa($('#lq'),L.questions);$('#dict').value=LS.get('dict-'+D.date,'');$('#dictOut').innerHTML='';
 const S=D.speak;$('#sp').textContent=S.prompt;$('#stip').textContent=S.tip||'';$('#sq').innerHTML='';
 S.questions.forEach((q,i)=>{const d=el('div',`<b>${i+1}.</b> ${esc(q)}<div class=row><button>⏱ 60 秒</button><button class=s>⏱ 45 秒重说</button><span class=timer></span></div><div class=out></div>`,'q');
  const[b60,b45]=d.querySelectorAll('button'),tm=d.querySelector('.timer'),out=d.querySelector('.out');let iv,r;
  const go=sec=>{clearInterval(iv);if(r)r.stop();let left=sec;tm.textContent=left+'s';iv=setInterval(()=>{tm.textContent=--left+'s';if(left<=0){clearInterval(iv);tm.textContent='⏰ 时间到';r&&r.stop()}},1000);
   if(!SR){out.innerHTML='<span class=muted>（浏览器不支持识别，只计时；可录给 AI 听）</span>';return}
   r=record((t,secs,fin)=>{const w=words(t).length;out.innerHTML=`<i>${esc(t)}</i><br><b>${w} 词 · ${secs>3?Math.round(w/secs*60):0} 词/分钟</b>${fin?' <span class=muted>（B2 目标约 110–150 词/分）</span>':''}`})};
  b60.onclick=()=>go(60);b45.onclick=()=>go(45);$('#sq').append(d)});
 const R=D.read;$('#rt').textContent=R.title;let h=esc(R.text);const vs=[...R.vocab].sort((a,b)=>b[0].length-a[0].length);
 vs.forEach((v,i)=>{h=h.replace(new RegExp('\\b('+v[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','i'),`<span class=v data-i="${R.vocab.indexOf(v)}">$1</span>`)});
 $('#rtext').innerHTML=split(R.text).length?h:'';$('#rtext').querySelectorAll('.v').forEach(s=>s.onclick=()=>{const v=R.vocab[s.dataset.i];say(v[0]);const p=$('#pop');p.style.display='block';p.innerHTML=`<b>${esc(v[0])}</b> ${esc(v[1])}${v[2]?'<br><small>'+esc(v[2])+'</small>':''}`;clearTimeout(p.t);p.t=setTimeout(()=>p.style.display='none',5000)});
 const rb=el('button','▶ 朗读全文','s');rb.onclick=()=>say(R.text);$('#rtext').prepend(rb);qa($('#rq'),R.questions);
 const W=D.write;$('#wtask').textContent=W.task;$('#wm').textContent=W.model;$('#wm').classList.add('hidden');$('#wchk').textContent=W.check||'';
 $('#phr').innerHTML='';W.phrases.forEach(p=>{const b=el('button',esc(p),'s');b.onclick=()=>{const t=$('#wtxt');t.setRangeText((t.value&&!/\s$/.test(t.value)?' ':'')+p,t.selectionStart,t.selectionEnd,'end');t.focus();t.oninput()};$('#phr').append(b)});
 $('#wtxt').value=LS.get('write-'+D.date,'');$('#wtxt').oninput()}
const copy=t=>navigator.clipboard.writeText(t).then(()=>alert('已复制 ✅'),()=>prompt('手动复制：',t));
$('#rate').value=rate;$('#rv').textContent=rate;$('#rate').oninput=e=>{rate=+e.target.value;$('#rv').textContent=rate;LS.set('rate',rate)};
$('#showT').onchange=e=>{$('#sents').classList.toggle('hidden',!e.target.checked);document.querySelectorAll('#shadow .tx').forEach(x=>x.classList.toggle('hidden',!e.target.checked))};
$('#lplay').onclick=()=>{let i=0;const lis=$('#sents').children;const nx=()=>{[...lis].forEach(x=>x.classList.remove('cur'));if(i>=sents.length)return;lis[i].classList.add('cur');say(sents[i++],nx)};
 if(speechSynthesis.paused){speechSynthesis.resume();return}if(speechSynthesis.speaking){speechSynthesis.pause();return}nx()};
$('#lstop').onclick=()=>speechSynthesis.cancel();
$('#dictChk').onclick=()=>{const i=+$('#dictSel').value;$('#dictOut').innerHTML=diff(i<0?D.listen.text:sents[i],$('#dict').value)};
$('#dict').oninput=e=>LS.set('dict-'+D.date,e.target.value);$('#dictSel').onchange=e=>{const i=+e.target.value;if(i>=0)say(sents[i])};
$('#spCopy').onclick=()=>copy(D.speak.prompt);
$('#wtxt').oninput=()=>{const v=$('#wtxt').value;$('#wc').textContent=words(v).length+' 词 · '+(v.match(/[.!?](\s|$)/g)||[]).length+' 句';if(D)LS.set('write-'+D.date,v)};
$('#wcopy').onclick=()=>copy(D.write.feedbackPrompt+'\n\nTask: '+D.write.task+'\n\nMy text:\n'+$('#wtxt').value);
$('#wmodel').onclick=()=>{if($('#wm').classList.contains('hidden')&&words($('#wtxt').value).length<30&&!confirm('还没写够 30 词，确定先看范文？'))return;$('#wm').classList.toggle('hidden')};
async function load(d){D=await (await fetch('data/'+d+'.json',{cache:'no-cache'})).json();history.replaceState(0,'','#'+d);render()}
(async()=>{const idx=await (await fetch('data/index.json',{cache:'no-cache'})).json(),ds=[...idx.dates].sort().reverse();
 $('#date').innerHTML=ds.map(d=>`<option>${d}</option>`).join('');const h=location.hash.slice(1);const d=ds.includes(h)?h:ds[0];$('#date').value=d;
 $('#date').onchange=e=>load(e.target.value);await load(d);window.__ok=true})().catch(e=>{document.body.prepend(el('p','加载失败：'+esc(e.message),'bad'))});
