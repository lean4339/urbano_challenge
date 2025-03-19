import { AxiosResponse } from 'axios';

import Content from '../models/content/Content';
import ContentQuery from '../models/content/ContentQuery';
import CreateContentRequest from '../models/content/CreateContentRequest';
import UpdateContentRequest from '../models/content/UpdateContentRequest';
import apiService from './ApiService';

class ContentService {
  async findAll(
    courseId: string,
    contentQuery: ContentQuery,
  ): Promise<{ data: Content[]; total: number; page: number; limit: number }> {
    const response: AxiosResponse<{
      data: Content[];
      total: number;
      page: number;
      limit: number;
    }> = await apiService.get(`/api/courses/${courseId}/contents`, {
      params: contentQuery,
    });

    console.log(response); // 🔥 Depuración: Verifica la estructura de la respuesta

    return response.data; // ✅ Retorna la data correctamente tipada
  }

  async save(
    courseId: string,
    createContentRequest: CreateContentRequest,
  ): Promise<void> {
    const data = await apiService.post<Content>(
      `/api/courses/${courseId}/contents`,
      {
        ...createContentRequest,
        file: null,
      },
    );
    const formData = new FormData();
    formData.append('file', createContentRequest.file);

    await apiService.post(`/api/uploads/image/${data.data.id}`, formData, {
      headers: {
        'x-filename': createContentRequest.file.name, // ✅ Sends original filename
      }, // ✅ Let the browser set the actual file type
    });
  }

  async update(
    courseId: string,
    id: string,
    updateContentRequest: UpdateContentRequest,
  ): Promise<void> {
    await apiService.put(
      `/api/courses/${courseId}/contents/${id}`,
      updateContentRequest,
    );
  }

  async delete(courseId: string, id: string): Promise<void> {
    await apiService.delete(`/api/courses/${courseId}/contents/${id}`);
  }
  async findLatestUpdates(
    limit: number = 5,
  ): Promise<{
    data: {
      id: number;
      url: string;
      course: string;
      update: string;
      date: string;
    }[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response: AxiosResponse<{
      data: {
        id: number;
        course: string;
        url: string;
        update: string;
        date: string;
      }[];
      total: number;
      page: number;
      limit: number;
    }> = await apiService.get(`/api/courses/updates`, {
      params: { limit }, // Enviamos el límite como parámetro
    });

    console.log(response); // 🔥 Depuración: Verifica la estructura de la respuesta

    return response.data; // ✅ Retorna la data correctamente tipada
  }
}

export default new ContentService();
