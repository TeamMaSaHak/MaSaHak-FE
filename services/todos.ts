import { get, post, patch, del, put } from "./api-client";

export interface Todo {
  id: number;
  content: string;
  isCompleted: boolean;
  createdAt: string;
  order?: number;
}

export interface RecurringTodo {
  id: number;
  content: string;
  createdAt: string;
}

// Regular Todos

export function getTodos(date: string) {
  return get<{ date: string; todos: Todo[] }>(`/api/todos?date=${date}`);
}

export function createTodo(content: string, date: string) {
  return post<Todo>("/api/todos", { content, date });
}

export function updateTodo(todoId: number, content: string) {
  return patch<Todo>(`/api/todos/${todoId}`, { content });
}

export function deleteTodo(todoId: number) {
  return del<{ id: number; deleted: boolean }>(`/api/todos/${todoId}`);
}

export function toggleTodo(todoId: number) {
  return patch<{ id: number; isCompleted: boolean; toggledAt: string }>(
    `/api/todos/${todoId}/toggle`
  );
}

// Recurring Todos

export function getRecurringTodos() {
  return get<{ recurringTodos: RecurringTodo[] }>("/api/todos/recurring");
}

export function createRecurringTodo(content: string) {
  return post<RecurringTodo>("/api/todos/recurring", { content });
}

export function updateRecurringTodo(recurringId: number, content: string) {
  return put<RecurringTodo>(`/api/todos/recurring/${recurringId}`, { content });
}

export function deleteRecurringTodo(recurringId: number) {
  return del<{ id: number; deleted: boolean }>(
    `/api/todos/recurring/${recurringId}`
  );
}

export function reorderTodos(items: { id: number; order: number }[]) {
  return patch<{ updated: boolean }>("/api/todos/reorder", { items });
}
