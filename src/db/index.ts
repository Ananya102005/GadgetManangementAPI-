import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = ()=>{
    return new PrismaClient();
}

export default prismaClientSingleton;