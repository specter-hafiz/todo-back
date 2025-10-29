/**
 * GraphQL Schema Definition
 * Defines all GraphQL types, queries, and mutations
 */

export const typeDefs = `#graphql
  enum TodoPriority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum TodoStatus {
    TODO
    IN_PROGRESS
    COMPLETED
  }

  type Todo {
    id: ID!
    title: String!
    description: String
    status: TodoStatus!
    priority: TodoPriority!
    dueDate: String
    tags: [String!]!
    completed: Boolean!
    isOverdue: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type TodoList {
    todos: [Todo!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type TodoStats {
    total: Int!
    completed: Int!
    pending: Int!
    byPriority: PriorityStats!
    byStatus: StatusStats!
  }

  type PriorityStats {
    LOW: Int
    MEDIUM: Int
    HIGH: Int
    URGENT: Int
  }

  type StatusStats {
    TODO: Int
    IN_PROGRESS: Int
    COMPLETED: Int
  }

  input TodoInput {
    title: String!
    description: String
    priority: TodoPriority
    dueDate: String
    tags: [String!]
  }

  input TodoUpdateInput {
    title: String
    description: String
    status: TodoStatus
    priority: TodoPriority
    dueDate: String
    tags: [String!]
    completed: Boolean
  }

  input TodoFilters {
    status: TodoStatus
    completed: Boolean
    priority: TodoPriority
    tags: [String!]
    search: String
    dueDateBefore: String
    dueDateAfter: String
  }

  input PaginationInput {
    page: Int
    limit: Int
    sortBy: String
    sortOrder: String
  }

  type Query {
    todos(filters: TodoFilters, pagination: PaginationInput): TodoList!
    todo(id: ID!): Todo
    todoStats: TodoStats!
  }

  type Mutation {
    createTodo(input: TodoInput!): Todo!
    updateTodo(id: ID!, input: TodoUpdateInput!): Todo
    deleteTodo(id: ID!): Boolean!
    deleteCompletedTodos: Int!
    toggleTodoStatus(id: ID!): Todo
  }
`;
