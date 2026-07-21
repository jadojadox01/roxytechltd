import { PrismaClient } from "@prisma/client"
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prismaClient = globalForPrisma.prisma || new PrismaClient({
  adapter,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient

export const prismaClientInstance = prismaClient

type SafePrismaModel = {
  findFirst: (...args: any[]) => Promise<any>;
  findUnique: (...args: any[]) => Promise<any>;
  findMany: (...args: any[]) => Promise<any>;
  create: (...args: any[]) => Promise<any>;
  update: (...args: any[]) => Promise<any>;
  delete: (...args: any[]) => Promise<any>;
  upsert: (...args: any[]) => Promise<any>;
  count: (...args: any[]) => Promise<number>;
  [key: string]: any;
}

const safePrismaModel: SafePrismaModel = {
  findFirst: async () => null,
  findUnique: async () => null,
  findMany: async () => [],
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  upsert: async () => null,
  count: async () => 0,
}

export const prisma: any = new Proxy(prismaClient, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver)
    if (typeof value !== 'undefined') return value
    return safePrismaModel
  },
})

export function getPrismaModel(modelName: string): SafePrismaModel {
  return (prisma as any)[modelName] ?? safePrismaModel
}
