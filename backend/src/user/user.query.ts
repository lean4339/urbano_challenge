export class UserQuery {
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
  page?: number;
  limit?: number;
  orderBy?: 'firstName' | 'lastName' | 'username';
  orderDir?: 'ASC' | 'DESC';
}