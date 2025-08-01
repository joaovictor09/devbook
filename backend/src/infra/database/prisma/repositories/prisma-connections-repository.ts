import { Injectable } from '@nestjs/common'
import { Prisma, Connection } from '@prisma/client'
import {
  ConnectionsRepository,
  ConnectionWithUsers,
} from '@/repositories/connections-repository'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaConnectionsRepository implements ConnectionsRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    data: Prisma.ConnectionUncheckedCreateInput,
  ): Promise<Connection> {
    return this.prisma.connection.create({ data })
  }

  async findBetweenUsers(
    userAId: string,
    userBId: string,
  ): Promise<Connection | null> {
    return this.prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: userAId, recipientId: userBId },
          { senderId: userBId, recipientId: userAId },
        ],
      },
    })
  }

  async countActiveByUserId(userId: string): Promise<number> {
    const count = await this.prisma.connection.count({
      where: {
        OR: [{ recipientId: userId }, { senderId: userId }],
        status: 'ACCEPTED',
      },
    })

    return count
  }

  async accept(connectionId: string): Promise<Connection> {
    return this.prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'ACCEPTED' },
    })
  }

  decline(connectionId: string): Promise<Connection> {
    return this.prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'DECLINED' },
    })
  }

  async delete(connectionId: string): Promise<void> {
    await this.prisma.connection.delete({
      where: { id: connectionId },
    })
  }

  async findById(connectionId: string): Promise<Connection | null> {
    return this.prisma.connection.findUnique({
      where: { id: connectionId },
    })
  }

  async fetchByUser({
    userId,
    status,
    direction,
  }: {
    userId: string
    status?: 'PENDING' | 'ACCEPTED' | 'DECLINED'
    direction?: 'SENT' | 'RECEIVED'
  }): Promise<ConnectionWithUsers[]> {
    const where: Prisma.ConnectionWhereInput = {
      ...(status ? { status } : {}),
      ...(direction === 'SENT'
        ? { senderId: userId }
        : direction === 'RECEIVED'
          ? { recipientId: userId }
          : {
              OR: [{ senderId: userId }, { recipientId: userId }],
            }),
    }

    return this.prisma.connection.findMany({
      where,
      include: {
        recipient: true,
        sender: true,
      },
    })
  }
}
