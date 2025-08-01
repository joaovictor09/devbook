export type UserDto = {
  id: string
  name: string
  username: string
}

export type UserDetailDTO = UserDto & {
  bio: string | null
  location: string | null
  title: string | null
  connections: number
  scraps: number
  communities: number
  memberSince: Date
}
