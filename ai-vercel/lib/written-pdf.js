// Server-owned PDF extraction. Browser-supplied questions/references are never trusted.
import crypto from 'node:crypto';
export const REFERENCE_MAX = 6500;
const normalize = s => String(s || '').normalize('NFC').replace(/\u00ad/g, '').replace(/\s+/g, ' ').trim();
const numbered = s => /^\s*\*?(?:Sual\s*)?(\d{1,3})[.)]\s*(.+)$/iu.exec(s);
const directive = /(?:izah edin|əsaslandırın|açıqlayın|fərqləndirin|sadalayın|hesablayın|nədir|hansıdır|\?|\(\d+\s*bal\))/iu;
export function writtenQuestions(lines) {
  const visible = lines.filter(l => l.text && !l.toc && !/^(?:\d+(?:\s*\/\s*\d+)?|Mövzu\s*\d+\s*\/\s*Sual\s*\d+.*)$/iu.test(l.text));
  const sizes = visible.filter(l => l.text.length > 60).map(l => l.size).sort((a,b)=>a-b);
  const bodySize = sizes[Math.floor(sizes.length/2)] || 11;
  const styles = new Map();
  for (const line of visible) if (numbered(line.text)) {
    const key = line.font + ':' + line.size;
    if (!styles.has(key)) styles.set(key, { nums: new Set(), pages: new Set(), size: line.size });
    const group = styles.get(key);group.nums.add(Number(numbered(line.text)[1]));group.pages.add(line.page);
  }
  const ranked = [...styles].filter(([,g])=>g.nums.size>=3).sort((a,b)=>(b[1].nums.size*2+b[1].pages.size*2+b[1].size)-(a[1].nums.size*2+a[1].pages.size*2+a[1].size));
  const primary = ranked[0]?.[0];
  const starts = [];
  for (let i=0;i<visible.length;i++) {
    const line=visible[i], match=numbered(line.text);if(!match || /(?:\.\s*){4,}/.test(line.text))continue;
    let answerSoon=false;
    for(const next of visible.slice(i+1,i+5)){if(numbered(next.text))break;if(/^(?:cavab|answer)\s*:/iu.test(next.text)){answerSoon=true;break;}}
    if (line.font+':'+line.size===primary || line.size>=Math.max(12,bodySize*1.25) || answerSoon || directive.test(match[2])) starts.push(i);
  }
  const questions=[], seen=new Set();let skipped=0;
  for(let n=0;n<starts.length;n++) {
    const start=starts[n], end=starts[n+1]??visible.length, first=visible[start], match=numbered(first.text);
    let title=match[2], cursor=start+1;
    while(cursor<end && visible[cursor].size>=first.size*.95 && visible[cursor].font===first.font && !/^(?:cavab|answer)\s*:/iu.test(visible[cursor].text) && title.length<500)title+=' '+visible[cursor++].text;
    const reference=normalize(visible.slice(cursor,end).map(l=>l.text).join('\n').replace(/^(?:cavab|answer)\s*:/iu,''));
    title=normalize(title);
    if(title.length<5 || title.length>600 || reference.length<140 || reference.length>REFERENCE_MAX || (reference.match(/\p{L}/gu)||[]).length<80 || /(?:qrafiki|şəkli|sxemi)\s*(?:çəkin|qurun)/iu.test(title)){skipped++;continue;}
    const key=title.toLocaleLowerCase('az');if(seen.has(key))continue;seen.add(key);
    questions.push({id:crypto.createHash('sha256').update(title+'\n'+reference).digest('hex').slice(0,24),number:Number(match[1]),title,reference,page:first.page});
  }
  return {questions,detected:starts.length,skipped};
}

export async function parseWrittenPdf(bytes, {includeText=false}={}) {
  const {getDocumentProxy,getResolvedPDFJS}=await import('unpdf');
  const ops=includeText?(await getResolvedPDFJS()).OPS:null;
  const pdf=await getDocumentProxy(new Uint8Array(bytes),{isEvalSupported:false,maxImageSize:16_777_216});
  const lines=[], textPages=[], deadline=Date.now()+25000;
  try {
    if(pdf.numPages>250)throw new Error('source_too_large');
    for(let n=1;n<=pdf.numPages;n++) {
      if(Date.now()>deadline)throw new Error('source_timeout');
      const page=await pdf.getPage(n), viewport=page.getViewport({scale:1}), content=await page.getTextContent();
      const items=content.items.filter(i=>i.str?.trim()&&i.transform[5]>40&&i.transform[5]<viewport.height-18).sort((a,b)=>b.transform[5]-a.transform[5]||a.transform[4]-b.transform[4]);
      const grouped=[];
      for(const item of items) {
        const y=item.transform[5], h=Math.abs(item.transform[3])||item.height||10;
        let line=grouped.at(-1);
        if(!line||Math.abs(line.y-y)>Math.max(2,h*.4)){line={y,items:[]};grouped.push(line);}
        line.items.push(item);
      }
      const pageLines=grouped.map(g=>{
        const ordered=g.items.sort((a,b)=>a.transform[4]-b.transform[4]);let text='',prev;
        for(const i of ordered){if(prev&&i.transform[4]-(prev.transform[4]+prev.width)>1&&!/\s$/.test(text)&&!/^\s/.test(i.str))text+=' ';text+=i.str;prev=i;}
        const dominant=[...ordered].sort((a,b)=>b.str.length-a.str.length)[0];
        return {text:normalize(text),page:n,size:Math.round(Math.abs(dominant.transform[3])*10)/10,font:dominant.fontName};
      });
      const toc=pageLines.some(l=>/^(?:mündəricat|sual xəritəsi|contents|table of contents)/iu.test(l.text)) || pageLines.filter(l=>/(?:\.\s*){6,}/.test(l.text)).length>=3;
      lines.push(...pageLines.map(l=>({...l,toc})));
      if(includeText){
        const operators=await page.getOperatorList();
        const images=operators.fnArray.some(op=>[ops.paintImageXObject,ops.paintInlineImageXObject,ops.paintImageMaskXObject,ops.paintImageXObjectRepeat,ops.paintInlineImageXObjectGroup].includes(op));
        textPages.push(images?'[UNEC_PDF_IMAGE]':pageLines.map(l=>l.text).join('\n'));
      }
      page.cleanup();
      if(n%5===0)await new Promise(r=>setTimeout(r,0));
    }
    return {...writtenQuestions(lines),...(includeText?{text:textPages.join('\n\f\n')}:{}),pages:pdf.numPages,sha:crypto.createHash('sha256').update(bytes).digest('hex')};
  } finally {await pdf.loadingTask.destroy();}
}
const cache=new Map();
export async function loadWrittenPool(source) {
  const key=source.url+'|'+source.addedAt;
  const hit=cache.get(key);if(hit&&Date.now()-hit.time<3600000)return hit.work;
  const work=(async()=>{
    const response=await fetch(source.url,{signal:AbortSignal.timeout(15000),redirect:'error',headers:{Accept:'application/pdf'}});
    if(!response.ok)throw new Error('source_unavailable');
    if(Number(response.headers.get('content-length'))>20*1024*1024)throw new Error('source_too_large');
    const reader=response.body.getReader(),chunks=[];let size=0;
    while(true){const{done,value}=await reader.read();if(done)break;size+=value.length;if(size>20*1024*1024){await reader.cancel();throw new Error('source_too_large');}chunks.push(value);}
    const bytes=Buffer.concat(chunks);
    if(!bytes.subarray(0,5).equals(Buffer.from('%PDF-')))throw new Error('source_unavailable');
    return parseWrittenPdf(bytes);
  })();
  cache.set(key,{time:Date.now(),work});while(cache.size>8)cache.delete(cache.keys().next().value);
  try{return await work;}catch(e){cache.delete(key);throw e;}
}
