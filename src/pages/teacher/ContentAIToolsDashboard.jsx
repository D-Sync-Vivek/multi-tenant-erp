import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import Card from "../../components/erp/teacher/Card";


const toolsInfo = [

{
id: 1,
title: 'Lesson Plan Generator',
desc: 'Create structured 45-minute lesson plans aligned with curriculum standards.',
icon: 'assignment',

link: '/teacher/ai-tools/lesson-plan'
},

{
id: 2,
title: 'Worksheet Generator',
desc: 'Generate topic-specific practice sheets with varying difficulty levels.',
icon: 'description',

link: '/teacher/ai-tools/worksheet'
},

{
id: 3,
title: 'Quiz Generator',
desc: 'Instant MCQs and short answers based on your uploaded reading material.',
icon: 'quiz',

link: '/teacher/ai-tools/quiz'
},

{
id: 4,
title: 'Question Paper Generator',
desc: 'Design formal term exams with automated marks allocation and keys.',
icon: 'history_edu',

link: '/teacher/ai-tools/question-paper'
},

{
id: 5,
title: 'Study Notes Generator',
desc: 'Synthesize complex lectures into bulleted summaries.',
icon: 'menu_book',

link: '/teacher/ai-tools/study-notes'
},

{
id: 6,
title: 'Presentation Outline',
desc: 'Develop slide-by-slide narrative arcs.',
icon: 'speaker_notes',

link: '/teacher/ai-tools/presentation-outline'
},

{
id: 7,
title: 'Rubric Generator',
desc: 'Create objective grading criteria.',
icon: 'rule',

link: '/teacher/ai-tools/rubric'
}

];

const historyData = [
  { id: 1, title: 'Quantum Mechanics Basics', type: 'Lesson Plan', subject: 'Physics 101', date: 'Oct 24, 2023', icon: 'article', iconColor: 'text-blue-500', badgeColor: 'bg-blue-50 text-blue-700' },
  { id: 2, title: 'Molecular Biology Mid-Term', type: 'Question Paper', subject: 'Biology', date: 'Oct 22, 2023', icon: 'quiz', iconColor: 'text-[#6b38d4]', badgeColor: 'bg-purple-50 text-purple-700' },
  { id: 3, title: 'Lab Safety Procedures', type: 'Rubric', subject: 'Chemistry', date: 'Oct 19, 2023', icon: 'task_alt', iconColor: 'text-[#b75b00]', badgeColor: 'bg-orange-50 text-orange-700' },
  { id: 4, title: 'Industrial Revolution Summary', type: 'Study Notes', subject: 'History', date: 'Oct 15, 2023', icon: 'edit_note', iconColor: 'text-green-500', badgeColor: 'bg-green-50 text-green-700' }
];

const ContentAIToolsDashboard = () => {
  return (
    <MainLayout title="Content & AI Tools">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Welcome Header Section */}
        <section className="relative overflow-hidden rounded-3xl bg-primary px-8 py-10 text-white shadow-lg">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-[#924700] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">AI Powered</span>
            </div>
            <h2 className="text-3xl font-display font-extrabold mb-3 leading-tight text-white">Elevate Your Teaching with The Intelligent Architect</h2>
            <p className="text-blue-100 font-body text-lg opacity-90">Generate structured educational content in seconds. Choose a tool below to begin your creative process.</p>
          </div>
          {/* Decorative background elements */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -right-10 bottom-0 w-64 h-64 bg-[#8455ef]/20 rounded-full blur-2xl"></div>
        </section>

        {/* AI Tools Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-display font-bold text-on-surface">Creative Toolset</h3>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
              <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {toolsInfo.map(tool => (
              <Link to={tool.link} key={tool.id} className="group bg-surface-container-lowest p-6 rounded-2xl shadow-ambient hover:bg-primary transition-all duration-300 transform hover:-translate-y-1" style={{boxShadow: '0px 12px 32px rgba(11,28,48,0.06)'}}>
                <div className="w-12 h-12 bg-surface-container-low group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white" style={{fontVariationSettings: "'FILL' 1"}}>{tool.icon}</span>
                </div>
                <h4 className="font-display font-bold text-lg mb-2 group-hover:text-white text-on-surface">{tool.title}</h4>
                <p className="text-on-surface-variant text-sm group-hover:text-blue-100 mb-6 font-body leading-relaxed">{tool.desc}</p>
                <div className="w-full py-3 bg-surface-container-high group-hover:bg-white text-primary font-bold rounded-xl text-sm transition-colors text-center">Open Tool</div>
              </Link>
            ))}

            {/* Coming Soon Placeholder */}
            <div className="border-2 border-dashed border-outline-variant p-6 rounded-2xl flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-outline-variant">
                <span className="material-symbols-outlined text-on-surface-variant">add_circle</span>
              </div>
              <h4 className="font-display font-bold text-lg mb-2 text-on-surface">Request Tool</h4>
              <p className="text-on-surface-variant text-sm font-body">New AI features arriving every month.</p>
            </div>
          </div>
        </section>

        {/* Saved Content Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-bold text-on-surface">Saved & Recent Content</h3>
            <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline outline-none border-none cursor-pointer bg-transparent">
              View All History <span className="material-symbols-outlined text-sm block">arrow_forward</span>
            </button>
          </div>
          
          {/* Table Container */}
          <Card className="p-0 overflow-hidden" style={{boxShadow: '0px 12px 32px rgba(11,28,48,0.06)'}}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-container">
                    <th className="px-6 py-4 font-display font-bold text-sm text-on-surface">Content Title</th>
                    <th className="px-6 py-4 font-display font-bold text-sm text-on-surface">Type</th>
                    <th className="px-6 py-4 font-display font-bold text-sm text-on-surface">Subject</th>
                    <th className="px-6 py-4 font-display font-bold text-sm text-on-surface">Date</th>
                    <th className="px-6 py-4 font-display font-bold text-sm text-on-surface text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container/50">
                  {historyData.map(item => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined ${item.iconColor} block`}>{item.icon}</span>
                          <span className="font-bold text-sm text-on-surface">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 ${item.badgeColor} rounded-full text-[11px] font-bold uppercase tracking-tight whitespace-nowrap`}>{item.type}</span>
                      </td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant font-medium whitespace-nowrap">{item.subject}</td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant font-medium whitespace-nowrap">{item.date}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-white rounded-lg transition-colors text-on-surface-variant shadow-sm outline-none border-none cursor-pointer bg-transparent" title="Open"><span className="material-symbols-outlined text-lg block">open_in_new</span></button>
                          <button className="p-2 hover:bg-white rounded-lg transition-colors text-on-surface-variant shadow-sm outline-none border-none cursor-pointer bg-transparent" title="Edit"><span className="material-symbols-outlined text-lg block">edit</span></button>
                          <button className="p-2 hover:bg-white rounded-lg transition-colors text-on-surface-variant shadow-sm outline-none border-none cursor-pointer bg-transparent" title="Download"><span className="material-symbols-outlined text-lg block">download</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

      </div>

      {/* AI Chatbot Floating Trigger */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#924700] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-50 outline-none border-none cursor-pointer">
        <span className="material-symbols-outlined text-3xl block" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
      </button>

    </MainLayout>
  );
};

export default ContentAIToolsDashboard;
