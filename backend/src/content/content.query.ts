export class ContentQuery {
  name?: string;
  description?: string;
  page?: number;
  limit?: number;
  orderBy?: 'firstName' | 'lastName' | 'username';
  orderDir?: 'ASC' | 'DESC';
}
