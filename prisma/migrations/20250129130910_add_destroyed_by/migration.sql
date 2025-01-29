-- AlterTable
ALTER TABLE "Gadget" ADD COLUMN     "destroyedById" TEXT;

-- AddForeignKey
ALTER TABLE "Gadget" ADD CONSTRAINT "Gadget_destroyedById_fkey" FOREIGN KEY ("destroyedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
