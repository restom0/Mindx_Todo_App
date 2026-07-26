import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {todoApi} from "../../services/todoApi.js";

const initialFilters = {
  filter: "all",
  search: "",
  sort: "createdAt",
  order: "desc"
};

const getLanguage = (state) => state?.settings?.language ?? "en";
const getErrorMessage = (action) => action?.payload ?? action?.error?.message ?? "Request failed";
const getResponseItems = (payload) => (Array.isArray(payload?.data) ? payload.data : []);
const getResponseMeta = (payload) =>
  payload?.meta && typeof payload.meta === "object" ? payload.meta : null;

export const fetchTodos = createAsyncThunk(
  "todos/fetch",
  async (options = {}, {getState, rejectWithValue}) => {
    const state = getState();
    const query = {
      ...state.todos.filters,
      page: "1",
      limit: "100"
    };

    if (options?.demo) {
      query.demo = "true";
    }

    try {
      return await todoApi.list(query, getLanguage(state));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTodo = createAsyncThunk(
  "todos/create",
  async (payload, {getState, rejectWithValue}) => {
    try {
      return await todoApi.create(payload, getLanguage(getState()));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTodo = createAsyncThunk(
  "todos/update",
  async ({id, changes}, {getState, rejectWithValue}) => {
    try {
      return await todoApi.update(id, changes, getLanguage(getState()));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTodo = createAsyncThunk(
  "todos/delete",
  async (id, {getState, rejectWithValue}) => {
    try {
      const response = await todoApi.remove(id, getLanguage(getState()));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const todosSlice = createSlice({
  name: "todos",
  initialState: {
    items: [],
    meta: null,
    filters: initialFilters,
    status: "idle",
    saving: false,
    error: ""
  },
  reducers: {
    setFilter(state, action) {
      state.filters.filter = action.payload;
    },
    setSearch(state, action) {
      state.filters.search = action.payload;
    },
    setSort(state, action) {
      state.filters.sort = action.payload.sort;
      state.filters.order = action.payload.order;
    },
    resetTodoError(state) {
      state.error = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.status = state.items.length ? "refreshing" : "loading";
        state.error = "";
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = getResponseItems(action.payload);
        state.meta = getResponseMeta(action.payload);
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = "failed";
        state.error = getErrorMessage(action);
      })
      .addCase(createTodo.pending, (state) => {
        state.saving = true;
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload?.data) {
          state.items.unshift(action.payload.data);
        }
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.saving = false;
        state.error = getErrorMessage(action);
      })
      .addCase(updateTodo.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        state.saving = false;
        const updatedTodo = action.payload?.data;
        const index = state.items.findIndex((todo) => todo.id === updatedTodo?.id);
        if (index >= 0) {
          state.items[index] = updatedTodo;
        }
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.saving = false;
        state.error = getErrorMessage(action);
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        const deletedId = action.payload?.id;
        state.items = state.items.filter((todo) => todo.id !== deletedId);
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.error = getErrorMessage(action);
      });
  }
});

export const {resetTodoError, setFilter, setSearch, setSort} = todosSlice.actions;
export const selectTodos = (state) => state?.todos?.items ?? [];
export const selectTodoFilters = (state) => state?.todos?.filters ?? initialFilters;
export const selectTodoStatus = (state) => state?.todos?.status ?? "idle";
export const selectTodoSaving = (state) => state?.todos?.saving ?? false;
export const selectTodoError = (state) => state?.todos?.error ?? "";
export const selectTodoMeta = (state) => state?.todos?.meta ?? null;
export default todosSlice.reducer;
