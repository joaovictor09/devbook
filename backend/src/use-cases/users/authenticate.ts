import { UsersRepository } from '@/repositories/users-repository'
import { InvalidCredentialsError } from '../_errors/invalid-credentials-error'
import { HashComparer } from '@/cryptography/hash-comparer'
import { Encrypter } from '@/cryptography/encrypter'
import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/utils/either'

interface AuthenticateUseCaseRequest {
  username: string
  password: string
}

type AuthenticateUseCaseResponse = Either<
  InvalidCredentialsError,
  {
    accessToken: string
  }
>

@Injectable()
export class AuthenticateUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({
    username,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersRepository.findByUsername(username)

    if (!user) {
      return left(new InvalidCredentialsError())
    }

    const doesPasswordMatches = await this.hashComparer.compare(
      password,
      user.passwordHash,
    )

    if (!doesPasswordMatches) {
      return left(new InvalidCredentialsError())
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id,
    })

    return right({
      accessToken,
    })
  }
}
