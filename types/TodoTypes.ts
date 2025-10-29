/**
 * Type Definitions for Todo
 * Shared types across the application
 */

import { TodoPriority, TodoStatus } from "../models/Todo";

export interface TodoInput {
  title: string;
  description?: string;
  priority?: TodoPriority;
  dueDate?: Date | string;
  tags?: string[];
}

export interface TodoUpdateInput {
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: Date | string;
  tags?: string[];
  completed?: boolean;
}

export interface TodoFilters {
  status?: TodoStatus;
  completed?: boolean;
  priority?: TodoPriority;
  tags?: string[];
  search?: string;
  dueDateBefore?: Date | string;
  dueDateAfter?: Date | string;
}

export interface PaginationInput {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
