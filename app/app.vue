<script setup>
import draggable from 'vuedraggable';

const statuses = ['To Do', 'In Progress', 'Review', 'Done'];
const priorities = ['Low', 'Medium', 'High'];

const { data: tasks, refresh } = await useFetch('/api/tasks');

const board = ref({});

watch(tasks, (newTasks) => {
  if (newTasks) {
    statuses.forEach(status => {
      board.value[status] = newTasks.filter(t => t.status === status);
    });
  }
}, { immediate: true });

const colorMode = useColorMode();
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (val) => colorMode.preference = val ? 'dark' : 'light'
});

const newTask = ref({
  title: '',
  description: '',
  priority: 'Medium',
  status: 'To Do'
});

const isModalOpen = ref(false);
const isEditing = ref(false);
const currentTask = ref({ ...newTask.value });

const openCreateModal = () => {
  isEditing.value = false;
  currentTask.value = { ...newTask.value };
  isModalOpen.value = true;
};

const openEditModal = (task) => {
  isEditing.value = true;
  currentTask.value = { ...task };
  isModalOpen.value = true;
};

const saveTask = async () => {
  if (!currentTask.value.title) return;

  if (isEditing.value) {
    await $fetch(`/api/tasks/${currentTask.value.id}`, {
      method: 'PUT',
      body: currentTask.value
    });
  } else {
    await $fetch('/api/tasks', {
      method: 'POST',
      body: currentTask.value
    });
  }
  
  isModalOpen.value = false;
  refresh();
};

const deleteTask = async (id) => {
  await $fetch(`/api/tasks/${id}`, {
    method: 'DELETE'
  });
  refresh();
};

const updateStatus = async (task, newStatus) => {
  await $fetch(`/api/tasks/${task.id}`, {
    method: 'PATCH',
    body: { status: newStatus }
  });
  refresh();
};

const onDragChange = async (event, newStatus) => {
  if (event.added) {
    const task = event.added.element;
    await $fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      body: { status: newStatus }
    });
    // Update local task status to match backend
    task.status = newStatus;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'To Do': return 'neutral';
    case 'In Progress': return 'info';
    case 'Review': return 'warning';
    case 'Done': return 'success';
    default: return 'neutral';
  }
};

const getStatusClasses = (status) => {
  switch (status) {
    case 'To Do': return 'border-gray-500 text-gray-600 dark:text-gray-400';
    case 'In Progress': return 'border-sky-500 text-sky-600 dark:text-sky-400';
    case 'Review': return 'border-amber-500 text-amber-600 dark:text-amber-400';
    case 'Done': return 'border-emerald-500 text-emerald-600 dark:text-emerald-400';
    default: return 'border-gray-500 text-gray-600 dark:text-gray-400';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'error';
    case 'Medium': return 'warning';
    case 'Low': return 'success';
    default: return 'neutral';
  }
};
</script>

<template>
  <UApp>
    <UContainer class="py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Task Board</h1>
        <div class="flex items-center gap-4">
          <UButton
            :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
            color="neutral"
            variant="ghost"
            @click="isDark = !isDark"
          />
          <UButton icon="i-lucide-plus" @click="openCreateModal">Add Task</UButton>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        <div v-for="status in statuses" :key="status" class="flex flex-col gap-4">
          <div class="flex items-center justify-between px-2 py-1 border-b-2" :class="getStatusClasses(status)">
            <h2 class="font-bold uppercase text-sm tracking-wider">{{ status }}</h2>
            <UBadge size="xs" :color="getStatusColor(status)" variant="soft">{{ board[status]?.length || 0 }}</UBadge>
          </div>

          <draggable
            v-model="board[status]"
            group="tasks"
            item-key="id"
            class="flex flex-col gap-4 min-h-[150px] overflow-y-auto bg-gray-50 dark:bg-anthrazit-light p-3 rounded-lg border border-gray-200 dark:border-gray-800 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
            :style="{ maxHeight: 'calc(100vh - 250px)' }"
            @change="onDragChange($event, status)"
          >
            <template #item="{ element: task }">
              <UCard
                :key="task.id"
                :ui="{ 
                  body: 'p-4',
                  root: 'bg-white dark:bg-anthrazit border-gray-200 dark:border-gray-700'
                }"
                class="hover:ring-2 hover:ring-primary-500 transition-shadow cursor-grab active:cursor-grabbing"
              >
                <template #header>
                  <div class="flex justify-between items-start gap-2">
                    <div class="flex flex-col gap-1 min-w-0">
                      <span class="font-medium text-sm line-clamp-2">{{ task.title }}</span>
                    </div>
                    <UDropdownMenu :items="[[
                      { label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => openEditModal(task) },
                      { label: 'Delete', icon: 'i-lucide-trash', color: 'error', onSelect: () => deleteTask(task.id) }
                    ]]">
                      <UButton color="neutral" variant="ghost" icon="i-lucide-ellipsis-vertical" size="xs" class="shrink-0" />
                    </UDropdownMenu>
                  </div>
                </template>

                <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">
                  {{ task.description || 'No description' }}
                </p>

                <template #footer>
                  <div class="flex justify-between items-center">
                    <div class="flex gap-1">
                      <UBadge :color="getPriorityColor(task.priority)" variant="subtle" size="xs">
                        {{ task.priority }}
                      </UBadge>
                    </div>
                    
                    <USelect
                      :model-value="task.status"
                      :items="statuses"
                      size="xs"
                      :color="getStatusColor(task.status)"
                      variant="ghost"
                      @update:model-value="updateStatus(task, $event)"
                    />
                  </div>
                </template>
              </UCard>
            </template>
          </draggable>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <UModal v-model:open="isModalOpen" :title="isEditing ? 'Edit Task' : 'Create Task'">
        <template #content>
          <UCard :ui="{ 
            root: 'bg-white dark:bg-anthrazit border-gray-200 dark:border-gray-800',
            ring: '', 
            divide: 'divide-y divide-gray-100 dark:divide-gray-800' 
          }">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-base font-semibold leading-6">
                  {{ isEditing ? 'Edit Task' : 'Create Task' }}
                </h3>
                <UButton color="neutral" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isModalOpen = false" />
              </div>
            </template>

            <div class="space-y-4 py-2">
              <UFormField label="Title" required>
                <UInput v-model="currentTask.title" placeholder="What needs to be done?" autofocus class="w-full" />
              </UFormField>

              <UFormField label="Description">
                <UTextarea v-model="currentTask.description" placeholder="Add more details..." class="w-full" />
              </UFormField>

              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Priority">
                  <USelect v-model="currentTask.priority" :items="priorities" :color="getPriorityColor(currentTask.priority)" class="w-full" />
                </UFormField>
                <UFormField label="Status">
                  <USelect v-model="currentTask.status" :items="statuses" :color="getStatusColor(currentTask.status)" class="w-full" />
                </UFormField>
              </div>
            </div>

            <template #footer>
              <div class="flex justify-end gap-3">
                <UButton color="neutral" variant="ghost" @click="isModalOpen = false">Cancel</UButton>
                <UButton color="primary" @click="saveTask">{{ isEditing ? 'Save Changes' : 'Create Task' }}</UButton>
              </div>
            </template>
          </UCard>
        </template>
      </UModal>
    </UContainer>
  </UApp>
</template>

<style>
:root {
  --ui-bg: white;
}
.dark {
  --ui-bg: #1a1a1a;
}

body {
  margin: 0;
  background-color: var(--ui-bg);
  color: var(--ui-text-muted, inherit);
}
</style>
