import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { hash } from 'bcryptjs'
import { randomUUID } from 'crypto'

describe('Accept Connection Request (E2E)', () => {
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

  test('[POST] /connections/:connectionId/accept', async () => {
    const senderId = randomUUID()
    const recipientId = randomUUID()

    await prisma.user.create({
      data: {
        id: senderId,
        name: 'Sender User',
        email: 'sender@example.com',
        passwordHash: await hash('123456', 8),
      },
    })

    await prisma.user.create({
      data: {
        id: recipientId,
        name: 'Recipient User',
        email: 'recipient@example.com',
        passwordHash: await hash('abcdef', 8),
      },
    })

    const connection = await prisma.connection.create({
      data: {
        senderId,
        recipientId,
        status: 'PENDING',
      },
    })

    const accessToken = jwt.sign({ sub: recipientId })

    const response = await request(app.getHttpServer())
      .patch(`/connections/${connection.id}/accept`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      connection: expect.objectContaining({
        id: connection.id,
        senderId,
        recipientId,
        status: 'ACCEPTED',
      }),
    })
  })
})
