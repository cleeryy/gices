/*
  Warnings:

  - You are about to drop the column `createdAt` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `accounts` table. All the data in the column will be lost.
  - You are about to alter the column `userId` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(4)`.
  - You are about to drop the column `createdAt` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `sessions` table. All the data in the column will be lost.
  - You are about to alter the column `userId` on the `sessions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(4)`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(4)`.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `password` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the `Authenticator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verificationtokens` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `firstName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MailType" AS ENUM ('IN', 'OUT', 'BOTH');

-- DropForeignKey
ALTER TABLE "Authenticator" DROP CONSTRAINT "Authenticator_userId_fkey";

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ALTER COLUMN "userId" SET DATA TYPE VARCHAR(4);

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ALTER COLUMN "userId" SET DATA TYPE VARCHAR(4);

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "emailVerified",
DROP COLUMN "image",
DROP COLUMN "name",
ADD COLUMN     "firstName" VARCHAR(100) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastName" VARCHAR(100) NOT NULL,
ADD COLUMN     "serviceId" INTEGER NOT NULL,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(4),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Authenticator";

-- DropTable
DROP TABLE "verificationtokens";

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "mailType" "MailType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "council_members" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "position" VARCHAR(150) NOT NULL,
    "login" VARCHAR(20) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "council_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_in" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "subject" TEXT NOT NULL,
    "needsMayor" BOOLEAN NOT NULL DEFAULT false,
    "needsDgs" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_in_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_out" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "subject" TEXT NOT NULL,
    "reference" VARCHAR(50) NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "userId" VARCHAR(4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_out_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts_in" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_in_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts_out" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_out_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_copies" (
    "councilId" INTEGER NOT NULL,
    "mailInId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_copies_pkey" PRIMARY KEY ("councilId","mailInId")
);

-- CreateTable
CREATE TABLE "service_received_mails" (
    "serviceId" INTEGER NOT NULL,
    "mailInId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_received_mails_pkey" PRIMARY KEY ("serviceId","mailInId")
);

-- CreateTable
CREATE TABLE "user_received_mails" (
    "userId" VARCHAR(4) NOT NULL,
    "mailInId" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_received_mails_pkey" PRIMARY KEY ("userId","mailInId")
);

-- CreateTable
CREATE TABLE "mail_in_recipients" (
    "mailInId" INTEGER NOT NULL,
    "contactId" INTEGER NOT NULL,

    CONSTRAINT "mail_in_recipients_pkey" PRIMARY KEY ("mailInId","contactId")
);

-- CreateTable
CREATE TABLE "mail_out_recipients" (
    "mailOutId" INTEGER NOT NULL,
    "contactId" INTEGER NOT NULL,

    CONSTRAINT "mail_out_recipients_pkey" PRIMARY KEY ("mailOutId","contactId")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "services_name_key" ON "services"("name");

-- CreateIndex
CREATE UNIQUE INDEX "services_code_key" ON "services"("code");

-- CreateIndex
CREATE UNIQUE INDEX "council_members_login_key" ON "council_members"("login");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_out" ADD CONSTRAINT "mail_out_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_out" ADD CONSTRAINT "mail_out_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_copies" ADD CONSTRAINT "mail_copies_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "council_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_copies" ADD CONSTRAINT "mail_copies_mailInId_fkey" FOREIGN KEY ("mailInId") REFERENCES "mail_in"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_received_mails" ADD CONSTRAINT "service_received_mails_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_received_mails" ADD CONSTRAINT "service_received_mails_mailInId_fkey" FOREIGN KEY ("mailInId") REFERENCES "mail_in"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_received_mails" ADD CONSTRAINT "user_received_mails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_received_mails" ADD CONSTRAINT "user_received_mails_mailInId_fkey" FOREIGN KEY ("mailInId") REFERENCES "mail_in"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_in_recipients" ADD CONSTRAINT "mail_in_recipients_mailInId_fkey" FOREIGN KEY ("mailInId") REFERENCES "mail_in"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_in_recipients" ADD CONSTRAINT "mail_in_recipients_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts_in"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_out_recipients" ADD CONSTRAINT "mail_out_recipients_mailOutId_fkey" FOREIGN KEY ("mailOutId") REFERENCES "mail_out"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_out_recipients" ADD CONSTRAINT "mail_out_recipients_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts_out"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
