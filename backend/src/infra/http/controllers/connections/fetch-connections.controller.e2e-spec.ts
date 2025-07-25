import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { hash } from 'bcryptjs'
import { randomUUID } from 'crypto'

describe('Fetch Connections (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /connections', async () => {
    const userId = randomUUID()
    const friendId = randomUUID()

    await prisma.user.create({
      data: {
        id: userId,
        name: 'User',
        email: 'user@example.com',
        passwordHash: await hash('123456', 8),
      },
    })

    await prisma.user.create({
      data: {
        id: friendId,
        name: 'Friend',
        email: 'friend@example.com',
        passwordHash: await hash('abcdef', 8),
      },
    })

    await prisma.connection.create({
      data: {
        senderId: friendId,
        recipientId: userId,
        status: 'ACCEPTED',
      },
    })

    const accessToken = jwt.sign({ sub: userId })

    const response = await request(app.getHttpServer())
      .get('/connections')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.connections).toBeDefined()
    expect(Array.isArray(response.body.connections)).toBe(true)
    expect(response.body.connections[0]).toEqual(
      expect.objectContaining({
        senderId: friendId,
        recipientId: userId,
        status: 'ACCEPTED',
      }),
    )
  })
})
