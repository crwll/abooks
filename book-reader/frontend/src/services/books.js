import api from './api';

export const getBooksService = {
  async getAll(status = null) {
    const params = status ? { status } : {};
    const response = await api.get('/api/books/', { params });
    return response.data;
  },

  async getReading() {
    const response = await api.get('/api/books/reading');
    return response.data;
  },

  async getById(bookId) {
    const response = await api.get(`/api/books/${bookId}`);
    return response.data;
  },

  async getContent(bookId, chapter = 0) {
    const response = await api.get(`/api/books/${bookId}/content`, {
      params: { chapter }
    });
    return response.data;
  },

  async addBook(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/books/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteBook(bookId) {
    const response = await api.delete(`/api/books/${bookId}`);
    return response.data;
  },
};
