"use client";
import { useState, useEffect } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

const client = generateClient<Schema>();
Amplify.configure(outputs);

export default function TodoList() {
  const [todos, setTodos] = useState<Schema["Todo"]["type"][]>([]);
  const [subtasks, setSubtasks] = useState<{ [key: string]: Schema["Subtask"]["type"][] }>({});
  const [newTodoContent, setNewTodoContent] = useState("");
  const [newSubtaskContent, setNewSubtaskContent] = useState("");
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

  const fetchTodos = async () => {
    const { data: items } = await client.models.Todo.list();
    setTodos(items);

    const subtaskMap: { [key: string]: Schema["Subtask"]["type"][] } = {};
    for (const todo of items) {
      const { data: subtaskItems } = await client.models.Subtask.list({
        filter: { todo: { eq: todo.id } }
      });
      subtaskMap[todo.id] = subtaskItems;
    }
    setSubtasks(subtaskMap);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const createTodo = async (event) => {
    event.preventDefault();
    if (newTodoContent.trim() === "") {
      return;
    }

    const newTodo = await client.models.Todo.create({
      content: newTodoContent,
      isDone: false,
    });

    setNewTodoContent("");
    fetchTodos();
  };

  const createSubtask = async (event) => {
    event.preventDefault();
    if (newSubtaskContent.trim() === "" || !selectedTodoId) {
      return;
    }

    await client.models.Subtask.create({
      title: newSubtaskContent,
      description: "",
      todo: selectedTodoId,
    });

    setNewSubtaskContent("");
    fetchTodos();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-700 flex items-center justify-center">
      <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Todo List</h1>
        <form onSubmit={createTodo} className="mb-4">
          <div className="flex">
            <input
              type="text"
              value={newTodoContent}
              onChange={(e) => setNewTodoContent(e.target.value)}
              placeholder="Enter new todo"
              className="w-full p-2 border rounded-l-lg text-gray-800"
            />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600">
              Add
            </button>
          </div>
        </form>
        <ul className="list-disc pl-5 text-gray-800">
          {todos.map(({ id, content }) => (
            <li key={id} className="mb-4">
              <div className="flex justify-between items-center">
                <span>{content}</span>
                <button 
                  className="text-blue-500" 
                  onClick={() => setSelectedTodoId(selectedTodoId === id ? null : id)}>
                  {selectedTodoId === id ? "Hide Subtasks" : "Show Subtasks"}
                </button>
              </div>
              {selectedTodoId === id && (
                <div className="mt-2 ml-4">
                  <form onSubmit={createSubtask} className="mb-2">
                    <div className="flex">
                      <input
                        type="text"
                        value={newSubtaskContent}
                        onChange={(e) => setNewSubtaskContent(e.target.value)}
                        placeholder="Enter new subtask"
                        className="w-full p-2 border rounded-l-lg text-gray-800"
                      />
                      <button type="submit" className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600">
                        Add
                      </button>
                    </div>
                  </form>
                  <ul className="list-disc pl-5 text-gray-800">
                    {(subtasks[id] || []).map(({ id, title }) => (
                      <li key={id} className="mb-2">
                        {title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
