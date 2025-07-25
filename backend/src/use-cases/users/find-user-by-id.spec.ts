import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { FindUserByIdUseCase } from './find-user-by-id'
import { ResourceNotFoundError } from '../_errors/resource-not-found-error'

describe('Find User By ID Use Case', () => {
  let usersRepository: InMemoryUsersRepository
  let findUserByIdUseCase: FindUserByIdUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    findUserByIdUseCase = new FindUserByIdUseCase(usersRepository)
  })

  it('should return the user when given a valid ID', async () => {
    const createdUser = await usersRepository.create({
      name: 'João Dev',
      username: 'joao',
      passwordHash: 'hashed-password',
    })

    const result = await findUserByIdUseCase.execute({
      userId: createdUser.id,
    })

    expect(result.isRight()).toBeTruthy()

    if (result.isRight()) {
      expect(result.value.user).toEqual(
        expect.objectContaining({
          name: 'João Dev',
          username: 'joao',
        }),
      )
    }
  })

  it('should throw ResourceNotFoundError if user does not exist', async () => {
    const result = await findUserByIdUseCase.execute({
      userId: 'non-existent-id',
    })

    expect(result.isLeft).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
