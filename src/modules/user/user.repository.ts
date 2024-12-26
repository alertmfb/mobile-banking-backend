import { Prisma, User } from '@prisma/client';
import { GetAllUserQueryDto } from './dto/get-all-user-query.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
/**
 * Repository responsible for database operations related to the user entity
 */
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new user in the database.
   *
   * @param {Prisma.UserCreateInput} data
   * @returns {Promise<User>}
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prismaService.user.create({ data });
  }

  /**
   * Find one user by passing a query
   * @param {Prisma.UserWhereUniqueInput} query
   * @returns {Promise<User | null>}
   * @memberof UserRepository
   */
  async findOne(query: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: query });
  }

  async findOneByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: {
        phoneNumber: phoneNumber,
      },
    });
  }

  async findByPhoneOrEmail(str: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            phoneNumber: str,
          },
          {
            email: str,
          },
        ],
      },
    });
  }

  /**
   *  Gets all user in the databse
   *
   * @param {GetAllUserQueryDto} query
   * @returns {Promise<{ users: User[]; total: string }>}
   */
  async findAll(query: GetAllUserQueryDto) {
    const { page = 1, perPage = 10, keyword, role } = query;
    const skip = page && perPage ? (page - 1) * perPage : 0;
    const take = perPage ? Number(perPage) : 10;

    const where: any = {
      AND: [{ deleted: false }],
    };

    if (keyword) {
      where.OR = [
        { firstName: { contains: keyword, mode: 'insensitive' } },
        { lastName: { contains: keyword, mode: 'insensitive' } },
        { email: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.AND.push({
        roles: {
          some: {
            role: { name: { contains: role, mode: 'insensitive' } },
          },
        },
      });
    }

    const users = await this.prismaService.user.findMany({
      where,
      skip,
      take,
      include: {},
    });

    const total = await this.prismaService.user.count({ where });

    return { users, total };
  }

  /**
   * Find user by email
   * @param {string} email
   * @returns {Promise<User | null>}
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { username } });
  }

  /**
   * Find user by id
   * @param {string} id
   * @returns {Promise<User | null>}
   */
  async findById(id: string): Promise<User | null> {
    return await this.prismaService.user.findFirst({
      where: { id },
    });
  }

  /**
   * Update user by id
   *
   * @param {string} id
   * @param {Prisma.UserUpdateInput} data
   * @returns {Promise<User>}
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prismaService.user.update({ where: { id }, data });
  }

  /**
   * Delete user by id
   *
   * @param {string} id
   * @returns {Promise<User>}
   */
  async delete(id: string): Promise<User> {
    return this.prismaService.user.update({
      where: { id },
      data: undefined,
    });
  }
}
