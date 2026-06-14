from prisma import PrismaClient

prisma = PrismaClient()


async def get_db():
    return prisma
