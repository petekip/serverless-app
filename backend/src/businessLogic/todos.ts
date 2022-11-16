import { TodoAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils, generateImageUrl } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
 
import { TodoUpdate } from '../models/TodoUpdate';

// TODO: Implement businessLogic

const logger = createLogger('todos')
const todoAccess = new TodoAccess()

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  const itemId = uuid.v4()


  const result = await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString(),
    attachmentUrl: '',
  })

  logger.info('createTodo ' + JSON.stringify({
    result
  }))
  return result
}


export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  userId: string, todoId: string
): Promise<TodoUpdate> {


  const result =  await todoAccess.updateTodo({
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  }, userId, todoId)

  logger.info('updateTodo ' + JSON.stringify({
    result
  }))
  return result
}

export async function deleteTodo(
  todoId: string, userId: string
): Promise<string> {

  const result = await todoAccess.deleteTodo(
    todoId,
    userId
  )

  logger.info('deleteTodo ' + JSON.stringify({
    result
  }))
  return result
}

export async function updateAttachedImage(
  todo: TodoItem, imageId: string
): Promise<TodoItem> {
  todo.attachmentUrl = generateImageUrl(imageId)

  const result = await todoAccess.updateAttachedImage(todo)

  logger.info('updateAttachedImage ' + JSON.stringify({
    result
  }))
  return result
}


export async function todoExists(
  todoId: string, userId: string
): Promise<boolean> {

  const result = await todoAccess.todoExists(
    todoId, userId
  )

  logger.info('todoExists ' + JSON.stringify({
    result
  }))
  return result
}

export async function todoById(
  todoId: string
): Promise<TodoItem> {

  const result = await todoAccess.todoById(
    todoId,
  )

  logger.info('todoById ' + JSON.stringify({
    result
  }))
  return result
}


export async function getTodosForUser(
  todoId: string
): Promise<TodoItem[]> {

  const result = await todoAccess.getTodosForUser(
    todoId
  )

  logger.info('getTodosForUser ' + JSON.stringify({
    result
  }))
  return result
}

export async function createAttachmentPresignedUrl(imageId: string) {
  const result =  AttachmentUtils(imageId)
  
  logger.info('createAttachmentPresignedUrl ' + JSON.stringify({
    result
  }))
  return result
}