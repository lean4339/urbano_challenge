import { AxiosResponse } from 'axios';

import Course from '../models/course/Course';
import CourseQuery from '../models/course/CourseQuery';
import CreateCourseRequest from '../models/course/CreateCourseRequest';
import UpdateCourseRequest from '../models/course/UpdateCourseRequest';
import apiService from './ApiService';

class UserService {
  async save(createCourseRequest: CreateCourseRequest): Promise<void> {
    await apiService.post('/api/courses', createCourseRequest);
  }

  async findAll(
    courseQuery: CourseQuery,
  ): Promise<{ data: Course[]; total: number; page: number; limit: number }> {
    const response: AxiosResponse<{
      data: Course[];
      total: number;
      page: number;
      limit: number;
    }> = await apiService.get('/api/courses', { params: courseQuery });

    console.log(response); // 🔥 Depuración: Verifica la estructura de la respuesta

    return response.data; // ✅ Devuelve la data correctamente tipada
  }

  async findOne(id: string): Promise<Course> {
    return (await apiService.get<Course>(`/api/courses/${id}`)).data;
  }

  async update(
    id: string,
    updateCourseRequest: UpdateCourseRequest,
  ): Promise<void> {
    await apiService.put(`/api/courses/${id}`, updateCourseRequest);
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/api/courses/${id}`);
  }
}

export default new UserService();
