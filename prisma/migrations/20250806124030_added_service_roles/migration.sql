/*
  Warnings:

  - The primary key for the `service_received_mails` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "public"."MailDestinationType" AS ENUM ('INFO', 'SUIVI');

-- AlterTable
ALTER TABLE "public"."service_received_mails" DROP CONSTRAINT "service_received_mails_pkey",
ADD COLUMN     "type" "public"."MailDestinationType" NOT NULL DEFAULT 'INFO',
ADD CONSTRAINT "service_received_mails_pkey" PRIMARY KEY ("serviceId", "mailInId", "type");
