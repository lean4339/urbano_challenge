import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ILike, FindConditions, FindManyOptions } from 'typeorm';

import { CreateCourseDto, UpdateCourseDto } from './course.dto';
import { Course } from './course.entity';
import { CourseQuery } from './course.query';

@Injectable()
export class CourseService {
  async save(createCourseDto: CreateCourseDto): Promise<Course> {
    return await Course.create({
      ...createCourseDto,
      dateCreated: new Date(),
    }).save();
  }

  async findAll(courseQuery: CourseQuery): Promise<{ data: Course[];totalPages: number; totalItems: number; page: number; limit: number  }> {
    const where: FindConditions<Course> = {};
    const { name, description, page = 1, limit = 10, orderBy = 'name', orderDir = 'ASC' } = courseQuery;

    // Aplicar filtros solo si existen
    if (name) where.name = ILike(`%${name}%`);
    if (description) where.description = ILike(`%${description}%`);

    // Configurar opciones de consulta
    const options: FindManyOptions<Course> = {
      where,
      order: { [orderBy]: orderDir },
      take: limit,
      skip: (page - 1) * limit,
    };

    // Obtener cursos y total de elementos
    const [coursesDb, totalItems] = await Course.findAndCount(options);
  
    // Calcular total de páginas
    const totalPages = Math.ceil(totalItems / limit);
  
    return { data: coursesDb, totalPages, totalItems, page, limit };
}


  async findById(id: string): Promise<Course> {
    const course = await Course.findOne(id);
    if (!course) {
      throw new HttpException(
        `Could not find course with matching id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findById(id);
    return await Course.create({ id: course.id, ...updateCourseDto }).save();
  }

  async delete(id: string): Promise<string> {
    const course = await this.findById(id);
    await Course.delete(course);
    return id;
  }

  async count(): Promise<number> {
    return await Course.count();
  }
}
