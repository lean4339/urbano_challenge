export default interface CourseQuery {
  name?: string;
  description?: string;
  page?: number;
  limit?: number;
  orderBy?: 'name' | 'description';
  orderDir?: 'ASC' | 'DESC';
}
