import db from '../../utils/db';

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === 'GET') {
    return await db.getTasks();
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const { title, description, priority, status } = body;
    if (!title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Title is required',
      });
    }
    return await db.addTask(title, description, priority, status);
  }
});
