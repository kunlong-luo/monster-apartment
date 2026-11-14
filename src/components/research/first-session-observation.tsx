'use client';

import Link from 'next/link';
import {useState} from 'react';
import type {FormEvent} from 'react';
import {emptyFirstSessionRecord,firstSessionCsv} from '@/lib/research/first-session-csv';
import type {FirstSessionField,FirstSessionRecord} from '@/lib/research/first-session-csv';

const milestones: {field:FirstSessionField;label:string;hint:string}[]=[
  {field:'entered_workshop',label:'找到并进入工坊',hint:'是否自行找到工坊入口？'},
  {field:'assigned_worker_without_help',label:'无提示完成派工',hint:'必须由玩家自行发现并操作'},
  {field:'enabled_auto_production_without_help',label:'无提示开启自动生产',hint:'不是手动点击生产'},
  {field:'enabled_auto_delivery_without_help',label:'无提示开启自动履约',hint:'与自动生产分开观察'},
  {field:'completed_first_order',label:'完成第一笔正式委托',hint:'等待时间不足则留空，不算失败'},
  {field:'needed_hint',label:'主持人提供过提示',hint:'卡住至少 60 秒后才允许一次标准提示'},
];
const inputClass='min-h-11 w-full rounded-lg border border-[#aa896780] bg-[#211721] px-3 py-2 text-sm text-[#fce8cb] placeholder:text-[#aa998c] focus-visible:border-[#f9d6a0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f9d6a0]';
const sectionClass='rounded-2xl border border-[#b9956a55] bg-[#20151ee8] p-5 shadow-[0_16px_48px_#07040aa0] sm:p-7';

export function FirstSessionObservation(){
  const [record,setRecord]=useState<FirstSessionRecord>(emptyFirstSessionRecord);
  const [exportReady,setExportReady]=useState(false);
  const [message,setMessage]=useState('');
  const update=(field:FirstSessionField,value:string)=>{
    setRecord(previous=>({...previous,[field]:value}));
    setMessage('');
  };
  const csv=firstSessionCsv(record);
  const prepare=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    setExportReady(true);
    setMessage('CSV 已在本机生成；请下载或复制后自行归档。此页面不会上传任何观察数据。');
  };
  const download=()=>{
    const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;
    link.download='monster-apartment-r113-'+record.participant_id+'.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    setMessage('已触发本机 CSV 下载。请妥善保存文件；网站不保留副本。');
  };
  const copy=async()=>{
    try{
      await navigator.clipboard.writeText(csv);
      setMessage('CSV 已复制，可粘贴到匿名汇总表。');
    }catch{
      setMessage('无法直接复制。请选中下方 CSV 文本手动复制。');
    }
  };
  const clear=()=>{
    if(!window.confirm('清空当前尚未上传或保存的匿名观察记录？'))return;
    setRecord(emptyFirstSessionRecord());
    setExportReady(false);
    setMessage('已清空本页输入。');
  };
  return <main className="min-h-dvh bg-[#0d0911] px-4 py-10 text-[#f7e4c8] sm:px-6"
    data-testid="r113-observation-form">
    <div className="mx-auto max-w-[950px] space-y-7">
      <header className="space-y-3 border-b border-[#c3a07866] pb-7">
        <span className="text-xs tracking-[.25em] text-[#d6ab78]">MONSTER APARTMENT / RESEARCH / R11.3</span>
        <h1 className="font-serif text-3xl tracking-wider sm:text-4xl">首次试玩 · 匿名观察记录</h1>
        <p className="max-w-[750px] text-sm leading-7 text-[#ddc4ab]">
          仅供主持人记录首次玩家的真实行为，每人一份。15–20 分钟后按实际观察填写，
          未观察到的项目保持「未观察」，不能把自动化脚本或测试数据当作真实玩家。
        </p>
        <div className="rounded-lg border border-[#b9966d78] bg-[#382536] p-4 text-sm leading-7">
          <strong className="text-[#f9d3a2]">隐私与数据处理</strong>
          <p>本页只在当前浏览器内生成匿名观察 CSV，<b>不会上传或持久化观察记录</b>。
            不要填写姓名、联系方式、账号、真实玩家存档或未经允许的录屏信息。
            导出文件须由主持人自行保管；离开页面前请先下载。</p>
        </div>
      </header>

      <form onSubmit={prepare} className="space-y-6">
        <section className={sectionClass} aria-labelledby="observation-setup">
          <h2 id="observation-setup" className="mb-5 font-serif text-xl text-[#f4d39e]">01 · 试玩环境</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">匿名编号（仅 T01 格式）
              <input required pattern="T[0-9]{2,3}" title="例如 T01 或 T010"
                className={inputClass} placeholder="T01" autoComplete="off"
                data-testid="research-participant-id" value={record.participant_id}
                onChange={e=>update('participant_id',e.target.value)}/>
            </label>
            <label className="grid gap-2 text-sm">设备
              <select required aria-label="设备" data-testid="research-device" className={inputClass} value={record.device}
                onChange={e=>update('device',e.target.value)}>
                <option value="">请选择</option><option value="PC">PC / 桌面</option>
                <option value="mobile">手机 / 移动设备</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">视口（可选）
              <input className={inputClass} placeholder="例如 390×844" maxLength={35}
                value={record.viewport} onChange={e=>update('viewport',e.target.value)}/>
            </label>
            <label className="grid gap-2 text-sm">浏览器（可选）
              <input className={inputClass} placeholder="例如 Chrome" maxLength={45}
                value={record.browser} onChange={e=>update('browser',e.target.value)}/>
            </label>
            <label className="grid gap-2 text-sm">实际试玩分钟数
              <input className={inputClass} type="number" min="0" max="120" step="0.5"
                value={record.session_minutes} onChange={e=>update('session_minutes',e.target.value)}/>
            </label>
            <label className="grid gap-2 text-sm">可等待首单的实际分钟数
              <input className={inputClass} type="number" min="0" max="120" step="0.5"
                value={record.order_time_available_minutes}
                onChange={e=>update('order_time_available_minutes',e.target.value)}/>
            </label>
          </div>
        </section>

        <section className={sectionClass} aria-labelledby="observation-milestones">
          <h2 id="observation-milestones" className="mb-2 font-serif text-xl text-[#f4d39e]">02 · 观察到的行为</h2>
          <p className="mb-5 text-xs leading-6 text-[#cdb69e]">true 表示观察到，false 表示明确未完成；没有观察机会时应留空。</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {milestones.map(item=><label key={item.field}
              className="grid gap-2 rounded-lg border border-[#94745155] bg-[#160e18bf] p-4 text-sm">
              <span className="font-semibold">{item.label}</span>
              <span className="text-xs leading-5 text-[#cbb39a]">{item.hint}</span>
              <select className={inputClass} value={record[item.field]}
                data-testid={'research-'+item.field}
                onChange={e=>update(item.field,e.target.value)}>
                <option value="">未观察</option>
                <option value="true">true · 是</option><option value="false">false · 否</option>
              </select>
            </label>)}
          </div>
          <label className="mt-4 grid gap-2 text-sm">首次提示时间（分钟，可选）
            <input type="number" min="0" max="120" step="0.5" className={inputClass}
              value={record.hint_timestamp_minutes} onChange={e=>update('hint_timestamp_minutes',e.target.value)}/>
          </label>
        </section>

        <section className={sectionClass} aria-labelledby="observation-feedback">
          <h2 id="observation-feedback" className="mb-5 font-serif text-xl text-[#f4d39e]">03 · 卡点与重玩意愿</h2>
          <div className="space-y-4">
            <label className="grid gap-2 text-sm">最明显的障碍（页面、操作、现象；无则留空）
              <textarea className={inputClass+' min-h-24 resize-y'} maxLength={500}
                value={record.major_blocker} onChange={e=>update('major_blocker',e.target.value)}/>
            </label>
            <label className="grid gap-2 text-sm">玩家表示明天愿意再玩吗？
              <select className={inputClass} value={record.would_replay}
                data-testid="research-would-replay" onChange={e=>update('would_replay',e.target.value)}>
                <option value="">未询问</option><option value="yes">yes · 愿意</option>
                <option value="no">no · 不愿意</option><option value="unsure">unsure · 不确定</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">玩家自己的理由（非主持人推断）
              <textarea className={inputClass+' min-h-20 resize-y'} maxLength={500}
                value={record.replay_reason} onChange={e=>update('replay_reason',e.target.value)}/>
            </label>
            <label className="grid gap-2 text-sm">其他匿名观察说明
              <textarea className={inputClass+' min-h-28 resize-y'} maxLength={1000}
                placeholder="可记录发现时间、卡住的位置、是否得到提示；不要加入任何身份信息"
                value={record.notes} onChange={e=>update('notes',e.target.value)}/>
            </label>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" data-testid="research-generate-csv"
            className="min-h-11 rounded-lg border border-[#e6bf86] bg-[#724047] px-5 py-2.5 text-sm font-semibold text-[#fff1d6] hover:bg-[#8a4e55] focus-visible:outline-2 focus-visible:outline-[#ffe0ab]">
            生成单人 CSV
          </button>
          <button type="button" onClick={clear}
            className="min-h-11 rounded-lg border border-[#aa8a6b88] px-5 py-2.5 text-sm hover:border-[#e6bf86] focus-visible:outline-2 focus-visible:outline-[#ffe0ab]">
            清空本页
          </button>
        </div>
      </form>

      {exportReady&&<section className={sectionClass} aria-label="本机生成的 CSV">
        <h2 className="font-serif text-xl text-[#f4d39e]">04 · 导出匿名观察</h2>
        <p className="mt-2 mb-4 text-sm leading-7 text-[#d5bba0]">
          导出的字段顺序与 R11.3 正式观察模板一致，空值仍为空。
          请将每位玩家的单行记录汇总到同一个工作表；本页面不会保存或发送数据。
        </p>
        <div className="mb-4 flex flex-wrap gap-3">
          <button type="button" onClick={download} data-testid="research-download-csv"
            className="min-h-10 rounded-lg border border-[#e6bf86] bg-[#724047] px-4 py-2 text-sm">下载 CSV</button>
          <button type="button" onClick={()=>{void copy();}}
            className="min-h-10 rounded-lg border border-[#aa8a6b88] px-4 py-2 text-sm">复制 CSV</button>
        </div>
        <textarea readOnly value={csv} data-testid="research-csv-preview"
          aria-label="CSV 预览，可手动选择复制"
          className={inputClass+' min-h-32 resize-y font-mono text-xs'}/>
      </section>}
      <p role="status" className="text-sm leading-6 text-[#f5d6a4]">{message}</p>
      <footer className="border-t border-[#a98b6855] pt-5 text-xs leading-6 text-[#c5ad92]">
        <p>这是主持人观察工具，不是十人试玩的真实结果或自动统计。测试完成须人工核对匿名样本，
          再决定是否进入 R12 美术量产；不上传任何个人信息。</p>
        <Link href="/" className="mt-3 inline-block underline underline-offset-4 hover:text-[#ffe0ab]">返回游戏大厅</Link>
      </footer>
    </div>
  </main>;
}
