import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ILike, FindConditions, FindManyOptions } from 'typeorm';

import { CourseService } from '../course/course.service';
import { CreateContentDto, UpdateContentDto } from './content.dto';
import { Content } from './content.entity';
import { ContentQuery } from './content.query';

@Injectable()
export class ContentService {
  constructor(private readonly courseService: CourseService) {}

  async save(
    courseId: string,
    createContentDto: CreateContentDto,
  ): Promise<Content> {
    const { name, description } = createContentDto;
    const course = await this.courseService.findById(courseId);
    return await Content.create({
      name,
      description,
      course,
      dateCreated: new Date(),
    }).save();
  }

  async findAll(contentQuery: ContentQuery): Promise<{ data: Content[]; totalPages: number; totalItems: number }> {
    const where: FindConditions<Content> = {};
    const { name, description, page = 1, limit = 10, orderBy = 'name', orderDir = 'ASC' } = contentQuery;

    // Aplicar filtros solo si existen
    if (name) where.name = ILike(`%${name}%`);
    if (description) where.description = ILike(`%${description}%`);

    // Configurar opciones de consulta
    const options: FindManyOptions<Content> = {
      where,
      order: { [orderBy]: orderDir },
      take: limit,
      skip: (page - 1) * limit,
    };

    // Obtener contenido y total de elementos
    const [contentsDb, totalItems] = await Content.findAndCount(options);
  
    // Calcular total de páginas
    const totalPages = Math.ceil(totalItems / limit);
  
    return { data: contentsDb, totalPages, totalItems };
}


  async findById(id: string): Promise<Content> {
    const content = await Content.findOne(id);

    if (!content) {
      throw new HttpException(
        `Could not find content with matching id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return content;
  }

  async findByCourseIdAndId(courseId: string, id: string): Promise<Content> {
    const content = await Content.findOne({ where: { courseId, id } });
    if (!content) {
      throw new HttpException(
        `Could not find content with matching id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return content;
  }
  

  async findAllByCourseId(
    courseId: string,
    contentQuery: ContentQuery
  ): Promise<{ data: Content[]; totalPages: number; totalItems: number; page: number; limit: number }> {
    
    const where: FindConditions<Content> = { courseId };
    const { name, description, page = 1, limit = 10, orderBy = 'name', orderDir = 'ASC' } = contentQuery;
  
    // Aplicar filtros opcionales
    if (name) where.name = ILike(`%${name}%`);
    if (description) where.description = ILike(`%${description}%`);
  
    // Configurar opciones de consulta
    const options: FindManyOptions<Content> = {
      where,
      order: { [orderBy]: orderDir },
      take: limit,
      skip: (page - 1) * limit,
    };
  
    // Obtener contenidos filtrados y total de elementos
    const [contentsDb, totalItems] = await Content.findAndCount(options);
    
    // Calcular total de páginas
    const totalPages = Math.ceil(totalItems / limit);
  
    return { data: contentsDb, totalItems, totalPages, page, limit };
  }
  

  async update(
    courseId: string,
    id: string,
    updateContentDto: UpdateContentDto,
  ): Promise<Content> {
    const content = await this.findByCourseIdAndId(courseId, id);
    return await Content.create({ id: content.id, ...updateContentDto }).save();
  }
  async updateContentImage(contentId: string, imageUrl: string): Promise<void> {
    await Content.update({ id: contentId }, { url: imageUrl });
  }
  

  async delete(courseId: string, id: string): Promise<string> {
    const content = await this.findByCourseIdAndId(courseId, id);
    await Content.delete(content);
    return id;
  }

  async count(): Promise<number> {
    return await Content.count();
  }
  async findLatestUpdates(limit: number = 5): Promise<{ data: { id: string; course: string; update: string; url: string, date: string }[]; totalPages: number; totalItems: number }> {
    const [contents, totalItems] = await Content.findAndCount({
      order: { dateCreated: "DESC" },
      take: limit,
      relations: ["course"], // Aquí se hace el JOIN con la tabla Course
    });
  
    const formattedContents = contents.map((content) => ({
      id: content.id,
      course: content.course?.name ?? "Curso desconocido", // Verificamos que haya curso
      update: content.description,
      date: content.dateCreated.toISOString(),
      url: content.url,
    }));
  
    const totalPages = Math.ceil(totalItems / limit);
  
    return { data: formattedContents, totalPages, totalItems };
  }
  
}
