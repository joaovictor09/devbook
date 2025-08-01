import { Injectable } from '@nestjs/common'
import { UsersRepository } from '@/repositories/users-repository'
import { ResourceNotFoundError } from '../_errors/resource-not-found-error'
import { Either, left, right } from '@/utils/either'
import { UserDto } from '@/dtos/users.dto'

interface FindUserByIdUseCaseRequest {
  userId: string
}

type FindUserByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    user: UserDto
  }
>

@Injectable()
export class FindUserByIdUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
  }: FindUserByIdUseCaseRequest): Promise<FindUserByIdUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError())
    }

    return right({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
      },
    })
  }
}
