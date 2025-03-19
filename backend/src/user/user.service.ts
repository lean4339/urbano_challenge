import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ILike, FindConditions, FindManyOptions } from 'typeorm';


import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from './user.entity';
import { UserQuery } from './user.query';
import { Role } from 'src/enums/role.enum';
@Injectable()
export class UserService {
  async save(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.findByUsername(createUserDto.username);

    if (user) {
      throw new HttpException(
        `User with username ${createUserDto.username} is already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { password } = createUserDto;
    createUserDto.password = await bcrypt.hash(password, 10);
    return User.create(createUserDto).save();
  }

  async findAll(userQuery: UserQuery): Promise<{data:User[], totalPages: number, totalItems: number}> {
    const where: FindConditions<User> = {};
    const {
      firstName,
      lastName,
      username,
      role,
      page = 1,
      limit = 10,
      orderBy = 'firstName',
      orderDir = 'ASC',
    } = userQuery;

    // Aplicar filtros solo si existen
    if (firstName) where.firstName = ILike(`%${firstName}%`);
    if (lastName) where.lastName = ILike(`%${lastName}%`);
    if (username) where.username = ILike(`%${username}%`);
    if (role && Object.values(Role).includes(role as Role)) {
      where.role = role as Role; // ✅ Filtrado correcto
    }

    // Configurar opciones de consulta
    const options: FindManyOptions<User> = {
      where,
      order: { [orderBy]: orderDir },
      take: limit,
      skip: (page - 1) * limit,
    };

    const [usersDb, totalItems] = await User.findAndCount({
      where,
      order: { [orderBy]: orderDir },
      take: limit,
      skip: (page - 1) * limit,
    });
  
    // Calcular total de páginas
    const totalPages = Math.ceil(totalItems / limit);
  
    return { data: usersDb, totalPages, totalItems };
  }

  async findById(id: string): Promise<User> {
    const user = await User.findOne(id);

    if (!user) {
      throw new HttpException(
        `Could not find user with matching id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    return User.findOne({ where: { username } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const currentUser = await this.findById(id);

    /* If username is same as before, delete it from the dto */
    if (currentUser.username === updateUserDto.username) {
      delete updateUserDto.username;
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.username) {
      if (await this.findByUsername(updateUserDto.username)) {
        throw new HttpException(
          `User with username ${updateUserDto.username} is already exists`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return User.create({ id, ...updateUserDto }).save();
  }

  async delete(id: string): Promise<string> {
    await User.delete(await this.findById(id));
    return id;
  }

  async count(): Promise<number> {
    return await User.count();
  }

  /* Hash the refresh token and save it to the database */
  async setRefreshToken(id: string, refreshToken: string): Promise<void> {
    const user = await this.findById(id);
    await User.update(user, {
      refreshToken: refreshToken ? await bcrypt.hash(refreshToken, 10) : null,
    });
  }
}
