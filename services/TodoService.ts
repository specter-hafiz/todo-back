/**
 * Todo Service - Business Logic Layer
 * Handles all business logic for Todo operations
 */

import Todo, { ITodo, TodoPriority, TodoStatus } from "../models/Todo";
import {
  TodoInput,
  TodoUpdateInput,
  TodoFilters,
  PaginationInput,
} from "../types/TodoTypes";

export class TodoService {
  /**
   * Create a new todo
   */
  async createTodo(input: TodoInput): Promise<ITodo> {
    try {
      const todo = new Todo({
        title: input.title,
        description: input.description,
        priority: input.priority || TodoPriority.MEDIUM,
        status: TodoStatus.TODO,
        dueDate: input.dueDate,
        tags: input.tags || [],
        completed: false,
      });

      await todo.save();
      return todo;
    } catch (error) {
      throw new Error(
        `Failed to create todo: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all todos with optional filters and pagination
   */
  async getTodos(
    filters?: TodoFilters,
    pagination?: PaginationInput
  ): Promise<{ todos: ITodo[]; total: number }> {
    try {
      const query: any = {};

      // Apply filters
      if (filters) {
        if (filters.status !== undefined) {
          query.status = filters.status;
        }
        if (filters.completed !== undefined) {
          query.completed = filters.completed;
        }
        if (filters.priority) {
          query.priority = filters.priority;
        }
        if (filters.tags && filters.tags.length > 0) {
          query.tags = { $in: filters.tags };
        }
        if (filters.search) {
          query.$or = [
            { title: { $regex: filters.search, $options: "i" } },
            { description: { $regex: filters.search, $options: "i" } },
          ];
        }
        if (filters.dueDateBefore) {
          query.dueDate = {
            ...query.dueDate,
            $lte: new Date(filters.dueDateBefore),
          };
        }
        if (filters.dueDateAfter) {
          query.dueDate = {
            ...query.dueDate,
            $gte: new Date(filters.dueDateAfter),
          };
        }
      }

      // Pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const skip = (page - 1) * limit;
      const sortBy = pagination?.sortBy || "createdAt";
      const sortOrder = pagination?.sortOrder === "asc" ? 1 : -1;

      const [todos, total] = await Promise.all([
        Todo.find(query)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit),
        Todo.countDocuments(query),
      ]);

      return { todos, total };
    } catch (error) {
      throw new Error(
        `Failed to fetch todos: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get a single todo by ID
   */
  async getTodoById(id: string): Promise<ITodo | null> {
    try {
      const todo = await Todo.findById(id);
      return todo;
    } catch (error) {
      throw new Error(
        `Failed to fetch todo: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update a todo
   */
  async updateTodo(id: string, input: TodoUpdateInput): Promise<ITodo | null> {
    try {
      const updateData: any = {};

      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.completed !== undefined) {
        updateData.completed = input.completed;
        // If marking as completed, update status
        if (input.completed) {
          updateData.status = TodoStatus.COMPLETED;
        }
      }

      const todo = await Todo.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return todo;
    } catch (error) {
      throw new Error(
        `Failed to update todo: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete a todo
   */
  async deleteTodo(id: string): Promise<boolean> {
    try {
      const result = await Todo.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new Error(
        `Failed to delete todo: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete all completed todos
   */
  async deleteCompletedTodos(): Promise<number> {
    try {
      const result = await Todo.deleteMany({ completed: true });
      return result.deletedCount || 0;
    } catch (error) {
      throw new Error(
        `Failed to delete completed todos: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Toggle todo completion status
   */
  async toggleTodoStatus(id: string): Promise<ITodo | null> {
    try {
      const todo = await Todo.findById(id);
      if (!todo) return null;

      todo.completed = !todo.completed;
      todo.status = todo.completed ? TodoStatus.COMPLETED : TodoStatus.TODO;
      await todo.save();

      return todo;
    } catch (error) {
      throw new Error(
        `Failed to toggle todo status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get todo statistics
   */
  async getTodoStats(): Promise<any> {
    try {
      const [total, completed, pending, byPriority, byStatus] =
        await Promise.all([
          Todo.countDocuments(),
          Todo.countDocuments({ completed: true }),
          Todo.countDocuments({ completed: false }),
          Todo.aggregate([
            { $group: { _id: "$priority", count: { $sum: 1 } } },
          ]),
          Todo.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        ]);

      return {
        total,
        completed,
        pending,
        byPriority: byPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch todo statistics: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
