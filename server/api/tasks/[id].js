import db from '../../utils/db';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const method = event.method;

  if (method === 'GET') {
    const task = await db.getTaskById(id);
    if (!task) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task not found',
      });
    }
    return task;
  }

  if (method === 'PUT' || method === 'PATCH') {
    const body = await readBody(event);
    const { title, description, priority, status } = body;
    const updatedTask = await db.updateTask(id, title, description, priority, status);
    if (!updatedTask) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task not found',
      });
    }
    return updatedTask;
  }

  if (method === 'DELETE') {
    const deleted = await db.deleteTask(id);
    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task not found',
      });
    }
    return { success: true };
  }
});
