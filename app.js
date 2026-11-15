import {validateCards,filterCards,markdown,stages} from './model.mjs';
const $=s=>document.querySelector(s),key='ghostboard.v1';
const labels={spark:'灵光一闪',brewing:'正在酝酿',alive:'已经唤醒',video:'视频',code:'代码',writing:'写作'};
const prompts=['如果一座城市会做梦，它的梦是什么颜色？','把一个被遗忘的旧物，变成故事里的主角。','做一个让未来的自己感谢今天的你的工具。','用 30 秒，讲述一次没有说出口的告别。','如果幽灵也需要工作台，它会收藏哪些灵感？'];
const now=new Date().toISOString();
const demo=[{id:'demo-1',title:'午夜书店的最后一位客人',note:'30 秒短片：一间只在午夜营业的书店，书里记录着每个人还没发生的明天。\n先写三个镜头，再确定最后的反转。',kind:'video',stage:'spark',created:now},{id:'demo-2',title:'给未来的自己写一封信',note:'不用宏大的承诺。记录今天的一个小小愿望，和一件想坚持的事情。',kind:'writing',stage:'spark',created:now},{id:'demo-3',title:'会发光的番茄钟',note:'离线专注计时器。每完成一轮，点亮一颗小星星，让坚持看得见。',kind:'code',stage:'brewing',created:now},{id:'demo-4',title:'秋日城市声音采集',note:'整理街角的落叶声、便利店提示音和晚班公交。剪出一段有温度的城市日记。',kind:'video',stage:'alive',created:now}];
let cards=[],kind='all',editing=null,timer;
function notice(message){$('#notice').textContent=message;clearTimeout(timer);timer=setTimeout(()=>$('#notice').textContent='',6500);}
try{const saved=localStorage.getItem(key);cards=saved===null?demo:validateCards(JSON.parse(saved));}catch{notice('无法读取本地记录。原数据未被修改；请先导出或检查浏览器存储设置。');}
function save(next){try{localStorage.setItem(key,JSON.stringify(next));cards=next;render();return true;}catch{notice('保存失败：浏览器存储不可用或已满。请先导出备份。');return false;}}
function element(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
function button(text,action){const b=element('button',text);b.type='button';b.addEventListener('click',action);return b;}
function render(){
  $('#total').textContent=cards.length;$('#brewing-count').textContent=cards.filter(c=>c.stage==='brewing').length;$('#alive-count').textContent=cards.filter(c=>c.stage==='alive').length;
  const visible=filterCards(cards,$('#search').value,kind);$('#columns').replaceChildren();
  for(const stage of stages){
    const column=element('section',undefined,'column');column.setAttribute('aria-label',labels[stage]);
    const group=visible.filter(c=>c.stage===stage),head=element('div',undefined,'column-head'),title=element('div');title.append(element('b'),document.createTextNode(labels[stage]),element('span',String(group.length)));head.append(title,button('＋',()=>openEditor(null,stage)));column.append(head);
    if(!group.length)column.append(element('p','这里暂时很安静。\n添加灵感，让创作开始生长。','empty'));
    for(const c of group){const card=element('article',undefined,'card');card.append(element('span',labels[c.kind],'card-tag'),element('h3',c.title),element('p',c.note));const footer=element('div',undefined,'card-bottom'),actions=element('div',undefined,'card-actions');footer.append(element('small',new Intl.DateTimeFormat('zh-CN',{month:'short',day:'numeric'}).format(new Date(c.created))));actions.append(button('编辑',()=>openEditor(c.id)));
      if(stage!=='alive')actions.append(button(stage==='spark'?'开始酝酿 →':'唤醒 ✓',()=>{const next=cards.map(item=>item.id===c.id?{...item,stage:stages[stages.indexOf(stage)+1]}:item);if(save(next))notice('灵感向前了一步。');}));
      footer.append(actions);card.append(footer);column.append(card);
    }$('#columns').append(column);
  }
}
function openEditor(id=null,stage='spark'){
  editing=id;const c=cards.find(c=>c.id===id),form=$('#form');form.reset();$('#dialog-title').textContent=c?'编辑灵感':'收集新灵感';$('#delete').hidden=!c;
  form.elements.title.value=c?.title||'';form.elements.note.value=c?.note||'';form.elements.kind.value=c?.kind||'video';form.elements.stage.value=c?.stage||stage;
  $('#editor').showModal();form.elements.title.focus();
}
$('#form').addEventListener('submit',e=>{e.preventDefault();const f=e.target,title=f.elements.title.value.trim();if(!title){f.elements.title.setCustomValidity('请输入灵感标题');f.elements.title.reportValidity();return;}
  const old=cards.find(c=>c.id===editing),item={id:old?.id||crypto.randomUUID(),title,note:f.elements.note.value,stage:f.elements.stage.value,kind:f.elements.kind.value,created:old?.created||new Date().toISOString()};
  const next=old?cards.map(c=>c.id===editing?item:c):[item,...cards];if(next.length>5000){notice('最多保存 5000 条灵感，请先整理并导出。');return;}
  if(save(next)){$('#editor').close();notice('已保存到当前浏览器。');}
});
$('#form').elements.title.addEventListener('input',e=>e.target.setCustomValidity(''));
$('#new').addEventListener('click',()=>openEditor());$('#close').addEventListener('click',()=>$('#editor').close());
$('#delete').addEventListener('click',()=>{if(confirm('删除这条灵感？删除后无法撤销，建议先备份。')&&save(cards.filter(c=>c.id!==editing))){$('#editor').close();notice('灵感已删除。');}});
$('#search').addEventListener('input',render);
document.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>{kind=b.dataset.kind;document.querySelectorAll('[data-kind]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});render();}));
function download(text,type,extension){const url=URL.createObjectURL(new Blob([text],{type})),a=element('a');a.href=url;a.download=`ghostboard-${new Date().toISOString().slice(0,10)}.${extension}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#backup').addEventListener('click',()=>download(JSON.stringify(cards,null,2),'application/json','json'));
$('#export').addEventListener('click',()=>download(markdown(cards),'text/markdown;charset=utf-8','md'));
$('#import').addEventListener('click',()=>$('#file').click());
$('#file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>20*1024*1024)throw Error('备份文件不能超过 20 MB。');const imported=validateCards(JSON.parse(await file.text()));if(confirm(`导入 ${imported.length} 条灵感将替换当前记录。已备份并确认继续？`)&&save(imported))notice('备份已导入。');}catch(err){notice(err instanceof SyntaxError?'无法读取 JSON 备份，请检查文件格式。':err.message);}finally{e.target.value='';}});
let promptIndex=Math.floor(Math.random()*prompts.length);function showPrompt(){$('#prompt').textContent=prompts[promptIndex];}$('#shuffle').addEventListener('click',()=>{promptIndex=(promptIndex+1)%prompts.length;showPrompt();});
showPrompt();render();
