import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
const createdAtIndex = process.env.TODOS_CREATED_AT_INDEX
export class TodoAccess {

    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly todosTable = process.env.TODOS_TABLE) {
    }
  

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
      console.log('Getting todos for users')

      const result = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }).promise()

      const items = result.Items
      logger.info('getTodosForUser' + JSON.stringify({
        result: items
      }))
      return items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        console.log('Creating todos')
        const response = await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        console.log('Creating todos' + response + todo)

        logger.info('createTodo ' + JSON.stringify({
          result: todo
        }))
        return todo
    }

    async updateTodo(todo: TodoUpdate, userId: string, todoId: string): Promise<TodoUpdate> {
        console.log('Updating todos')
        await this.docClient.update({
          TableName: this.todosTable,
          Key: {
            todoId: todoId,
            userId:  userId,
          },
          UpdateExpression: "SET #myname = :Myname,  dueDate = :dueDate,  done = :done ",
          ExpressionAttributeValues: {
            ":Myname": todo.name,
            ":dueDate": todo.dueDate,
            ":done": todo.done,
          },
          ExpressionAttributeNames:{
            "#myname": "name"
          }
        }).promise()
    
        logger.info('updateTodo ' + JSON.stringify({
          result: todo
        }))
        return todo
      }
    
      async updateAttachedImage(todo: TodoItem): Promise<TodoItem> {
        await this.docClient.update({
          TableName: this.todosTable,
          Key: {
            userId:  todo.userId,
            todoId: todo.todoId,
            
          },
          UpdateExpression: "SET attachmentUrl = :attachmentUrl",
          ExpressionAttributeValues: {
            ":attachmentUrl": todo.attachmentUrl,
          },
        }).promise()
    
        logger.info('updateAttachedImage ' + JSON.stringify({
          result: todo
        }))
        return todo
      }


      async  todoExists(todoId: string, userId: string) {
        const result = await this.docClient
          .get({
            TableName: this.todosTable,
            Key: {
              todoId: todoId,
              userId: userId
            }
          })
          .promise()


        console.log('Get todo: ', result)

        logger.info('todoExists ' + JSON.stringify({
          fullResult: result,
          result: !!result.Item
        }))
        return !!result.Item
      }

      async  todoById(todoId: string): Promise<TodoItem> {
        const result = await this.docClient
          
          .query({
            TableName : this.todosTable,
            IndexName : createdAtIndex,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId
            }
        }).promise()

        console.log('Get todo: ', result)
        const item = result.Items[0]
    
        logger.info('todoById ' + JSON.stringify({
          result: item as TodoItem || null,
          oldresult: item || null
        }))
        if (item.length !== 0) return item as TodoItem

        return item as TodoItem || null
      }

      async deleteTodo(todoId: string, userId: string): Promise<string> {
        console.log('Deleting todo')
        await this.docClient.delete({
          TableName: this.todosTable,
          Key: {
            todoId: todoId,
            userId: userId
          }
        }).promise()
    
        logger.info('deleteTodo '  + JSON.stringify({
          result: 'Deleted'
        }))
        return 'Deleted'
      }



}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
    })
    }

    return new XAWS.DynamoDB.DocumentClient()
}