export const stages=['spark','brewing','alive'];
export function validateCards(value){
  if(!Array.isArray(value)||value.length>5000)throw Error('备份必须是最多 5000 条记录的数组。');
  const ids=new Set();
  return value.map(c=>{
    if(!c||typeof c.id!=='string'||!c.id||ids.has(c.id)||typeof c.title!=='string'||!c.title.trim()||c.title.length>100||typeof c.note!=='string'||c.note.length>3000||!stages.includes(c.stage)||!['video','code','writing'].includes(c.kind)||typeof c.created!=='string'||!Number.isFinite(Date.parse(c.created)))throw Error('备份格式无效，请导入 Ghostboard 导出的 JSON 文件。');
    ids.add(c.id);return {id:c.id,title:c.title.trim(),note:c.note,stage:c.stage,kind:c.kind,created:c.created};
  });
}
export function filterCards(cards,query='',kind='all'){
  const q=query.trim().toLocaleLowerCase();
  return cards.filter(c=>(kind==='all'||kind===c.kind)&&`${c.title} ${c.note}`.toLocaleLowerCase().includes(q));
}
export function markdown(cards){
  return '# Ghostboard 创作灵感\n\n'+cards.map(c=>`## ${c.title.replace(/[\r\n]/g,' ')}\n\n状态：${c.stage} · 类型：${c.kind}\n\n${c.note}\n`).join('\n');
}
