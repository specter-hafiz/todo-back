/**
 * GraphQL Resolvers with proper date formatting
 */

import { TodoService } from "../services/TodoService";
import {
  TodoInput,
  TodoUpdateInput,
  TodoFilters,
  PaginationInput,
} from "../types/TodoTypes";

const todoService = new TodoService();

// Helper function to format todo dates
const formatTodoResponse = (todo: any) => {
  return {
    ...todo.toObject(),
    id: todo._id.toString(),
    createdAt: todo.createdAt ? todo.createdAt.toISOString() : null,
    updatedAt: todo.updatedAt ? todo.updatedAt.toISOString() : null,
    dueDate: todo.dueDate ? todo.dueDate.toISOString() : null,
  };
};

export const resolvers = {
  Query: {
    /**
     * Get todos with filters and pagination
     */
    todos: async (
      _: any,
      args: { filters?: TodoFilters; pagination?: PaginationInput }
    ) => {
      try {
        const { todos, total } = await todoService.getTodos(
          args.filters,
          args.pagination
        );

        const page = args.pagination?.page || 1;
        const limit = args.pagination?.limit || 10;
        const totalPages = Math.ceil(total / limit);

        return {
          todos: todos.map(formatTodoResponse),
          total,
          page,
          limit,
          totalPages,
        };
      } catch (error) {
        throw new Error(
          `Failed to fetch todos: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },

    /**
     * Get a single todo by ID
     */
    todo: async (_: any, args: { id: string }) => {
      try {
        const todo = await todoService.getTodoById(args.id);
        if (!todo) {
          throw new Error("Todo not found");
        }
        return formatTodoResponse(todo);
      } catch (error) {
        throw new Error(
          `Failed to fetch todo: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },

    /**
     * Get todo statistics
     */
    todoStats: async () => {
      try {
        return await todoService.getTodoStats();
      } catch (error) {
        throw new Error(
          `Failed to fetch statistics: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
  },

  Mutation: {
    /**
     * Create a new todo
     */
    createTodo: async (_: any, args: { input: TodoInput }) => {
      try {
        const todo = await todoService.createTodo(args.input);
        return formatTodoResponse(todo);
      } catch (error) {
        throw new Error(
          `Failed to create todo: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },

    /**
     * Update an existing todo
     */
    updateTodo: async (
      _: any,
      args: { id: string; input: TodoUpdateInput }
    ) => {
      try {
        const todo = await todoService.updateTodo(args.id, args.input);
        if (!todo) {
          throw new Error("Todo not found");
        }
        return formatTodoResponse(todo);
      } catch (error) {
        throw new Error(
          `Failed to update todo: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },

    /**
     * Delete a todo
     */
    deleteTodo: async (_: any, args: { id: string }) => {
      try {
        const deleted = await todoService.deleteTodo(args.id);
        if (!deleted) {
          throw new Error("Todo not found");
        }
        return deleted;
      } catch (error) {
        throw new Error(
          `Failed to delete todo: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },

    /**
     * Delete all completed todos
     */
    deleteCompletedTodos: async () => {
      try {
        return await todoService.deleteCompletedTodos();
      } catch (error) {
        throw new Error(
          `Failed to delete completed todos: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },

    /**
     * Toggle todo completion status
     */
    toggleTodoStatus: async (_: any, args: { id: string }) => {
      try {
        const todo = await todoService.toggleTodoStatus(args.id);
        if (!todo) {
          throw new Error("Todo not found");
        }
        return formatTodoResponse(todo);
      } catch (error) {
        throw new Error(
          `Failed to toggle todo status: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
  },
};
