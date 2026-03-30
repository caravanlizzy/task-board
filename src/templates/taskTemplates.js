const renderTaskList = (tasks) => {
  return tasks.map(task => `
    <li class="p-3 hover:bg-slate-800 cursor-pointer border-l-4 border-transparent hover:border-purple-500 transition-all group" 
        hx-get="/tasks/${task.id}" 
        hx-target="#content" 
        hx-swap="innerHTML">
      <div class="flex flex-col">
        <span class="font-medium text-slate-300 group-hover:text-white text-sm">${task.title}</span>
        <div class="flex justify-between items-center mt-1">
          <span class="text-[9px] uppercase tracking-widest font-bold ${getPriorityColor(task.priority)}">${task.priority}</span>
          <span class="text-[9px] text-slate-500 font-bold uppercase">${task.status}</span>
        </div>
      </div>
    </li>
  `).join('');
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'text-red-400';
    case 'Medium': return 'text-yellow-400';
    case 'Low': return 'text-blue-400';
    default: return 'text-slate-400';
  }
};

const renderTaskBoard = (tasks) => {
  const statuses = ['To Do', 'In Progress', 'Done'];
  return `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
      ${statuses.map(status => `
        <div class="flex flex-col gap-4">
          <h3 class="text-[10px] font-black text-slate-500 flex items-center uppercase tracking-[0.2em] mb-2">
            <span class="w-3 h-3 rounded-full mr-2 ${status === 'To Do' ? 'bg-slate-500' : status === 'In Progress' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}"></span>
            ${status}
            <span class="ml-auto bg-slate-800 px-2 py-0.5 rounded text-[8px] text-slate-400">${tasks.filter(t => t.status === status).length}</span>
          </h3>
          <div class="space-y-4 min-h-[500px] bg-slate-900/20 p-4 rounded-3xl border border-dashed border-slate-800/50">
            ${tasks.filter(t => t.status === status).map(task => `
              <div class="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all shadow-sm cursor-pointer group"
                   hx-get="/tasks/${task.id}" hx-target="#content">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-[9px] uppercase tracking-widest font-black ${getPriorityColor(task.priority)}">${task.priority}</span>
                  <div class="h-1.5 w-1.5 rounded-full ${status === 'Done' ? 'bg-green-500' : 'bg-purple-500'}"></div>
                </div>
                <h4 class="text-white font-bold text-sm group-hover:text-purple-300 transition-colors">${task.title}</h4>
                <p class="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">${task.description || 'No description'}</p>
              </div>
            `).join('')}
            ${tasks.filter(t => t.status === status).length === 0 ? '<div class="text-center py-10 text-slate-600 text-[10px] uppercase font-bold tracking-widest">No tasks</div>' : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

const mainLayout = (taskListHtml, contentHtml = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Board</title>
  <script src="/htmx/htmx.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0f172a] text-slate-200 flex flex-col h-screen font-sans" hx-on="taskUpdated: htmx.ajax('GET', '/task-list', '#task-list')">
  <!-- Navbar -->
  <nav class="bg-[#1e293b] text-white p-4 shadow-xl flex justify-between items-center shrink-0 border-b border-purple-500/30">
    <div class="flex items-center gap-3">
      <div class="bg-purple-600 p-2 rounded-xl shadow-lg shadow-purple-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <h1 class="text-xl font-black tracking-tight cursor-pointer" hx-get="/" hx-target="body" hx-push-url="true">TASK<span class="text-purple-400">BOARD</span></h1>
    </div>
    <div class="flex gap-3">
      <button class="bg-slate-800 px-5 py-2 rounded-lg font-bold border border-slate-700 hover:bg-slate-700 transition-all text-xs tracking-widest uppercase" 
              hx-get="/board" 
              hx-target="#content">
        Board View
      </button>
      <button class="bg-purple-600 px-5 py-2 rounded-lg font-bold shadow-lg shadow-purple-500/20 hover:bg-purple-500 active:transform active:scale-95 transition-all text-xs tracking-widest uppercase" 
              hx-get="/tasks/new" 
              hx-target="#content" 
              hx-swap="innerHTML">
        + New Task
      </button>
    </div>
  </nav>

  <div class="flex flex-1 overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-72 bg-[#1e293b] border-r border-slate-700/50 overflow-y-auto shrink-0 hidden md:block">
      <div class="p-4 border-b border-slate-700/50 font-bold text-slate-400 flex justify-between items-center uppercase text-[10px] tracking-[0.2em]">
        <span>Recent Tasks</span>
        <button hx-get="/task-list" hx-target="#task-list" class="text-purple-400 hover:text-purple-300 transition p-1 hover:bg-slate-700 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <ul id="task-list" class="divide-y divide-slate-700/30">
        ${taskListHtml}
      </ul>
    </aside>

    <!-- Main Content -->
    <main id="content" class="flex-1 p-8 overflow-y-auto bg-[#0f172a]">
      ${contentHtml || `
        <div class="max-w-4xl mx-auto">
          <div class="text-center mt-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div class="bg-slate-800/50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-400 border border-slate-700/50 shadow-2xl">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-white">Welcome to Task Board</h2>
            <p class="mt-4 text-slate-400 max-w-md mx-auto leading-relaxed">Manage your tasks efficiently. View the board or create a new task to get started.</p>
            <div class="mt-10">
              <button hx-get="/board" hx-target="#content" class="bg-purple-600 px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all">Go to Board</button>
            </div>
          </div>
        </div>
      `}
    </main>
  </div>
</body>
</html>
`;

const taskDetails = (task) => `
<div class="max-w-4xl mx-auto animate-in fade-in duration-500">
  <div class="flex justify-between items-start mb-10 border-b border-slate-800 pb-8">
    <div>
      <div class="flex items-center gap-3 mb-4">
        <span class="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black rounded-md border border-purple-500/20 uppercase tracking-widest">${task.status}</span>
        <span class="px-2.5 py-1 bg-slate-800 text-slate-400 text-[10px] font-black rounded-md border border-slate-700 uppercase tracking-widest">${task.priority} Priority</span>
      </div>
      <h2 class="text-4xl font-black text-white tracking-tight">${task.title}</h2>
    </div>
    <div class="flex gap-3">
      <button class="bg-slate-800 text-slate-200 px-6 py-2.5 rounded-xl hover:bg-slate-700 transition-all font-bold border border-slate-700 flex items-center gap-2 shadow-lg" 
              hx-get="/tasks/${task.id}/edit" 
              hx-target="#content">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit
      </button>
      <button class="bg-red-500/10 text-red-400 px-4 py-2.5 rounded-xl hover:bg-red-500/20 transition-all font-bold border border-red-500/20" 
              hx-delete="/tasks/${task.id}" 
              hx-confirm="Are you sure you want to delete this task?"
              hx-target="body">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
  
  <section class="mb-12">
    <h3 class="text-[10px] font-black text-slate-500 mb-5 flex items-center uppercase tracking-[0.2em]">
      <span class="w-6 h-px bg-purple-500/30 mr-3"></span>
      Description
    </h3>
    <div class="bg-slate-800/30 p-8 rounded-3xl border border-slate-800/50 min-h-[200px] shadow-inner backdrop-blur-sm">
      <p class="text-slate-300 whitespace-pre-line leading-relaxed text-lg">${task.description || 'No description provided.'}</p>
    </div>
  </section>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div class="bg-[#1e293b] p-6 rounded-3xl border border-slate-700/50">
      <h4 class="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest">Status</h4>
      <div class="flex items-center gap-3">
        <div class="h-3 w-3 rounded-full ${task.status === 'Done' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : task.status === 'In Progress' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-slate-500'}"></div>
        <span class="text-xl font-bold text-white">${task.status}</span>
      </div>
    </div>
    <div class="bg-[#1e293b] p-6 rounded-3xl border border-slate-700/50">
      <h4 class="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest">Priority</h4>
      <span class="text-xl font-bold ${getPriorityColor(task.priority)}">${task.priority}</span>
    </div>
  </div>
</div>
`;

const taskForm = (task = {}) => {
  const isEdit = !!task.id;
  const actionUrl = isEdit ? `/tasks/${task.id}` : '/tasks';
  const method = isEdit ? 'hx-put' : 'hx-post';
  const title = isEdit ? `Edit Task` : 'New Task';
  const submitText = isEdit ? 'Save Changes' : 'Create Task';

  const priorities = ['Low', 'Medium', 'High'];
  const statuses = ['To Do', 'In Progress', 'Done'];

  return `
    <div class="max-w-2xl mx-auto bg-[#1e293b] p-10 rounded-[2.5rem] shadow-2xl border border-slate-700/50 animate-in zoom-in-95 duration-300">
      <h2 class="text-3xl font-black mb-10 text-white tracking-tight flex items-center gap-4">
        <span class="w-2 h-8 bg-purple-500 rounded-full"></span>
        ${title}
      </h2>
      <form ${method}="${actionUrl}" hx-target="${isEdit ? '#content' : 'body'}" 
            ${!isEdit ? 'hx-on::after-request="if(event.detail.successful) this.reset()"' : ''}>
        <div class="mb-8">
          <label class="block text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-3 ml-1">Task Title</label>
          <input type="text" name="title" value="${task.title || ''}" 
                 class="w-full px-5 py-4 bg-[#0f172a] border border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all font-medium text-white placeholder-slate-600" 
                 placeholder="What needs to be done?" required>
        </div>
        <div class="mb-8">
          <label class="block text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-3 ml-1">Description</label>
          <textarea name="description" 
                    class="w-full px-5 py-4 bg-[#0f172a] border border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none h-44 transition-all font-medium text-white placeholder-slate-600" 
                    placeholder="Provide some context...">${task.description || ''}</textarea>
        </div>
        
        <div class="grid grid-cols-2 gap-6 mb-10">
          <div>
            <label class="block text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-3 ml-1">Priority</label>
            <select name="priority" class="w-full px-5 py-4 bg-[#0f172a] border border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all font-medium text-white appearance-none cursor-pointer">
              ${priorities.map(p => `<option value="${p}" ${task.priority === p ? 'selected' : p === 'Medium' && !task.priority ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-3 ml-1">Status</label>
            <select name="status" class="w-full px-5 py-4 bg-[#0f172a] border border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all font-medium text-white appearance-none cursor-pointer">
              ${statuses.map(s => `<option value="${s}" ${task.status === s ? 'selected' : s === 'To Do' && !task.status ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="flex gap-4 pt-8 border-t border-slate-800">
          <button type="submit" class="flex-1 bg-purple-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:bg-purple-500 active:transform active:scale-95 transition-all">
            ${submitText}
          </button>
          <button type="button" class="px-8 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all border border-slate-700" 
                  hx-get="${isEdit ? `/tasks/${task.id}` : '/'}" hx-target="body">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;
};

module.exports = {
  renderTaskList,
  renderTaskBoard,
  mainLayout,
  taskDetails,
  taskForm
};
