import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { Encrypter } from 'src/cryptography/encrypter'

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(private jwtService: JwtService) {}

  encrypt(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '1d',
    })
  }
}
