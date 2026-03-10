/*
  Warnings:

  - You are about to drop the column `role` on the `project_members` table. All the data in the column will be lost.
  - Added the required column `project_role` to the `project_members` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('PM', 'DESIGNER', 'DEVELOPER', 'QA');

-- AlterTable
ALTER TABLE "project_members" DROP COLUMN "role",
ADD COLUMN     "project_role" "ProjectRole" NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "system_role" "SystemRole" NOT NULL DEFAULT 'MEMBER';

-- DropEnum
DROP TYPE "Role";
