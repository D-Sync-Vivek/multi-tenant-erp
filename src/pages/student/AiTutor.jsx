import React from 'react';
import MainLayout from '../../layouts/MainLayout';

export default function AiTutor() {
  return (
    <MainLayout title="Student Portal">
      <div className="p-8 flex-1 flex flex-col gap-6">

<div className="flex justify-between items-end mb-4">
<div>
<h2 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">AI Intelligent Tutor</h2>
<p className="text-on-surface-variant mt-1">Your personal academic companion powered by ScholarFlow AI.</p>
</div>
<div className="flex gap-3">
<button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-primary font-medium rounded-md shadow-sm border border-outline-variant/10 hover:bg-surface-container-low transition-colors">
<span className="material-symbols-outlined text-lg" data-icon="history">history</span>
<span>Recent Logs</span>
</button>
<button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary to-primary-container text-white font-semibold rounded-md shadow-lg shadow-primary/20">
<span className="material-symbols-outlined text-lg" data-icon="add">add</span>
<span>New Session</span>
</button>
</div>
</div>

<div className="grid grid-cols-12 gap-6 flex-1 min-h-[600px]">

<div className="col-span-12 lg:col-span-7 flex flex-col bg-surface-container-lowest rounded-lg border border-outline-variant/10 shadow-sm overflow-hidden">
<div className="px-6 py-4 border-b border-outline-variant/5 flex items-center justify-between bg-surface-container-low/30">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-emerald-500"/>
<span className="text-sm font-semibold text-on-surface">Active Session: Quantum Mechanics</span>
</div>
<div className="flex gap-2">
<button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-md transition-colors">
<span className="material-symbols-outlined text-xl" data-icon="volume_up">volume_up</span>
</button>
<button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-md transition-colors">
<span className="material-symbols-outlined text-xl" data-icon="more_vert">more_vert</span>
</button>
</div>
</div>

<div className="flex-1 p-6 overflow-y-auto space-y-6">

<div className="flex justify-end items-start gap-4">
<div className="max-w-[80%] bg-primary-container text-on-primary-container p-4 rounded-xl rounded-tr-none shadow-sm">
<p className="text-sm leading-relaxed">
  {/*Can you explain the basic concept of Quantum Mechanics? It feels very abstract and I&apos;m struggling with the Wave-Particle Duality part.*/}</p>
<span className="text-[10px] mt-2 block opacity-70">{/*10:42 AM*/}</span>
</div>
<img alt="Alexander" className="w-8 h-8 rounded-full" data-alt="avatar of a young male student" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7_trmCu23ZZmsRJDMng8NWkwGY3sTQc4xZPc_FRgBdbmG10XKSkz2yS7FAcuW71TiDgeYzeTjn57egF1JBjkssiaLtrhwfnjdt8iicIjqQ61rnJ-H__30CLll4IaFIbI7I7N3iY0xiXJR4fZQcXiB9xtUeeY8fhkR_xZRXzfYE-WTo8fTv0ql0-V_Q_8ddK7Fe9H5kVrUGG7cop9JaC9fKYUcKyUR8aK7pIpMUL3XuZbMGGGqtIefoi_TzDcK97XQhY-ZSbejNw"/>
</div>

<div className="flex justify-start items-start gap-4">
<div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white shrink-0">
<span className="material-symbols-outlined text-sm" data-icon="smart_toy" data-weight="fill" style={{ fontVariationSettings: `&apos` }}>smart_toy</span>
</div>
<div className="max-w-[85%] bg-surface-container-low p-5 rounded-xl rounded-tl-none space-y-4">
<p className="text-sm font-semibold text-secondary">{/*Hello Alexander! Let&apos;s demystify Quantum Mechanics together.*/}</p>
<p className="text-sm leading-relaxed text-on-surface-variant">{/*Think of Wave-Particle Duality not as a contradiction, but as a &quot;Dual Identity&quot;. Imagine a coin: it has two sides, but it&apos;s still one coin. Depending on how you look at it or measure it, it shows one side or the other.*/}</p>

<div className="bg-white p-4 rounded-lg border border-primary/10 space-y-3">
<div className="flex gap-3">
<div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</div>
<div>
<p className="text-xs font-bold text-on-surface">{/*The Wave Nature*/}</p>
<p className="text-xs text-on-surface-variant">{/*Light or electrons spread out through space, interfering with each other like ripples in a pond.*/}</p>
</div>
</div>
<div className="flex gap-3">
<div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</div>
<div>
<p className="text-xs font-bold text-on-surface">The Particle Nature</p>
<p className="text-xs text-on-surface-variant">When we &quot;touch&quot; or measure them, they collapse into a single point, behaving like tiny billiard balls.</p>
</div>
</div>
</div>
<div className="pt-2 flex gap-2">
<button className="text-[11px] font-bold text-primary px-3 py-1 bg-primary/5 rounded-full hover:bg-primary/10 transition-colors">Show Schrodinger&apos;s Cat Example</button>
<button className="text-[11px] font-bold text-primary px-3 py-1 bg-primary/5 rounded-full hover:bg-primary/10 transition-colors">Explain Uncertainty Principle</button>
</div>
<span className="text-[10px] mt-2 block opacity-50">AI Generated &#x2022; 10:43 AM</span>
</div>
</div>
</div>

<div className="p-4 bg-white border-t border-outline-variant/10">
<div className="relative flex items-center gap-2">
<button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
<span className="material-symbols-outlined" data-icon="attach_file">attach_file</span>
</button>
<input className="flex-1 bg-surface-container-low border-none rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none" placeholder="Ask anything about Quantum Mechanics..." type="text"/>
<div className="flex items-center gap-1 absolute right-16">
<button className="p-2 text-secondary hover:bg-secondary/10 rounded-full transition-colors">
<span className="material-symbols-outlined" data-icon="mic">mic</span>
</button>
</div>
<button className="w-10 h-10 bg-primary text-white rounded-md flex items-center justify-center shadow-md hover:bg-primary-container transition-all">
<span className="material-symbols-outlined" data-icon="send">send</span>
</button>
</div>
<div className="mt-2 flex items-center justify-center gap-4">
<p className="text-[10px] text-on-surface-variant/60 italic">AI Tutor can make mistakes. Verify important information.</p>
</div>
</div>
</div>

<div className="col-span-12 lg:col-span-5 space-y-6">

<div className="bg-surface-container-low rounded-lg p-6 relative overflow-hidden">
<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"/>
<div className="relative z-10">
<span className="px-2 py-1 bg-tertiary/10 text-tertiary text-[10px] font-bold rounded uppercase tracking-widest mb-4 inline-block">AI Insight</span>
<h3 className="text-xl font-bold font-headline mb-2 text-on-surface">Curated Resources</h3>
<p className="text-sm text-on-surface-variant mb-4">Based on your question, I&apos;ve gathered these tailored materials to help you visualize duality.</p>
<div className="space-y-3">
<div className="group flex items-center gap-4 p-3 bg-white rounded-md hover:shadow-md transition-all cursor-pointer">
<div className="w-10 h-10 bg-error/10 text-error flex items-center justify-center rounded">
<span className="material-symbols-outlined" data-icon="video_library">video_library</span>
</div>
<div className="flex-1">
<p className="text-xs font-bold text-on-surface">The Double Slit Experiment</p>
<p className="text-[10px] text-on-surface-variant">3:45 &#x2022; Visual Animation</p>
</div>
<span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors" data-icon="open_in_new">open_in_new</span>
</div>
<div className="group flex items-center gap-4 p-3 bg-white rounded-md hover:shadow-md transition-all cursor-pointer">
<div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded">
<span className="material-symbols-outlined" data-icon="article">article</span>
</div>
<div className="flex-1">
<p className="text-xs font-bold text-on-surface">Notes: Wave-Particle Duality</p>
<p className="text-[10px] text-on-surface-variant">PDF &#x2022; 12 Pages</p>
</div>
<span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors" data-icon="download">download</span>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-highest rounded-lg p-6">
<h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-primary" data-icon="auto_graph">auto_graph</span>
                        Learning Progress
                    </h3>
<div className="space-y-4">
<div>
<div className="flex justify-between text-xs mb-1">
<span className="text-on-surface-variant">Understanding: Quantum Mechanics</span>
<span className="font-bold text-primary">64%</span>
</div>
<div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
<div className="h-full bg-primary rounded-full" style={{ width: `64%` }}/>
</div>
</div>
<div className="p-3 bg-primary/5 rounded-md border border-primary/10">
<p className="text-xs text-on-surface-variant leading-tight">
<span className="font-bold text-primary">AI Tip:</span> You&apos;re doing great! You&apos;ve mastered 4/6 key concepts in this chapter. Try taking the <span className="underline font-bold cursor-pointer">Quick Quiz</span> to lock in this knowledge.
                            </p>
</div>
</div>
</div>

<div className="bg-white rounded-lg p-6 shadow-sm flex items-center justify-between">
<div>
<p className="text-sm font-bold text-on-surface">Voice Mode</p>
<p className="text-xs text-on-surface-variant">Talk directly with your tutor</p>
</div>
<div className="flex gap-2">
<button className="w-12 h-12 rounded-full border-2 border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all">
<span className="material-symbols-outlined" data-icon="hearing">hearing</span>
</button>
<button className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/20 hover:scale-105 transition-transform">
<span className="material-symbols-outlined" data-icon="mic" data-weight="fill" style={{ fontVariationSettings: `&apos` }}>mic</span>
</button>
</div>
</div>

<div className="grid grid-cols-2 gap-4">
<div className="col-span-2 bg-surface-container-low p-4 rounded-lg">
<p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Up Next</p>
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-600">
<span className="material-symbols-outlined" data-icon="functions">functions</span>
</div>
<div>
<p className="text-xs font-bold">Vector Calculus</p>
<p className="text-[10px] text-on-surface-variant">Starts at 2:00 PM</p>
</div>
</div>
</div>
</div>
</div>
</div>
</div>

    </MainLayout>
  );
}