import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { FindUserByIdUseCase } from '@/use-cases/users/find-user-by-id'
import { ResourceNotFoundError } from '@/use-cases/_errors/resource-not-found-error'

@Controller('/me')
export class GetMeController {
  constructor(private findUserById: FindUserByIdUseCase) {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    const result = await this.findUserById.execute({
      userId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }
}
