import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1761933861042 implements MigrationInterface {
    name = 'InitialSchema1761933861042'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "gallery_photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "photoUrl" character varying NOT NULL, "order" integer NOT NULL DEFAULT '0', "isFsk18" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_1eafc909ffac8de65a50960e440" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('customer', 'escort', 'business', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "username" character varying, "lastUsernameChange" TIMESTAMP, "emailVerified" boolean NOT NULL DEFAULT false, "emailVerificationToken" character varying, "emailVerificationExpires" TIMESTAMP, "firstName" character varying, "lastName" character varying, "profilePicture" character varying, "isOnline" boolean NOT NULL DEFAULT false, "lastSeen" TIMESTAMP, "readReceipts" boolean NOT NULL DEFAULT true, "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer', "location" geometry(Point,4326), "name" character varying, "showNameInProfile" boolean NOT NULL DEFAULT false, "birthDate" date, "gender" character varying, "nationalities" text array, "languages" text array, "type" character varying, "height" integer, "weight" integer, "clothingSize" character varying, "bodyType" character varying, "cupSize" character varying, "hairColor" character varying, "hairLength" character varying, "eyeColor" character varying, "intimateHair" character varying, "hasTattoos" boolean NOT NULL DEFAULT false, "hasPiercings" boolean NOT NULL DEFAULT false, "isSmoker" boolean NOT NULL DEFAULT false, "services" text array, "description" text, "availability" jsonb, "meetingPoints" text array, "price30Min" numeric(10,2), "price1Hour" numeric(10,2), "price2Hours" numeric(10,2), "price3Hours" numeric(10,2), "price6Hours" numeric(10,2), "price12Hours" numeric(10,2), "price24Hours" numeric(10,2), "priceOvernight" numeric(10,2), "priceWeekend" numeric(10,2), "bookmarkedEscorts" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "conversationId" character varying NOT NULL, "senderId" character varying NOT NULL, "content" text, "mediaUrl" character varying, "mediaType" character varying, "voiceUrl" character varying, "duration" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "isRead" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "participants" text array NOT NULL, "pinnedBy" text array NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "waitlist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "notified" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2221cffeeb64bff14201bd5b3de" UNIQUE ("email"), CONSTRAINT "PK_973cfbedc6381485681d6a6916c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reports_category_enum" AS ENUM('inappropriate_content', 'fake_profile', 'harassment', 'spam', 'scam', 'underage', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."reports_status_enum" AS ENUM('pending', 'reviewed', 'resolved', 'dismissed')`);
        await queryRunner.query(`CREATE TABLE "reports" ("id" SERIAL NOT NULL, "reporterId" uuid, "reportedUserId" uuid NOT NULL, "category" "public"."reports_category_enum" NOT NULL, "description" text NOT NULL, "status" "public"."reports_status_enum" NOT NULL DEFAULT 'pending', "adminNotes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "reviewedAt" TIMESTAMP, CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reviewerId" uuid NOT NULL, "reviewedUserId" uuid NOT NULL, "rating" integer NOT NULL, "comment" text, "isEdited" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "gallery_photos" ADD CONSTRAINT "FK_64ef1ba71edc7bffec2348eeefa" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_4353be8309ce86650def2f8572d" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_c88d2686339ad6d166620b741a6" FOREIGN KEY ("reportedUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_f9238c3e3739dc40322f577fc46" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_1370bfc5359ac6a0d8b744e9f88" FOREIGN KEY ("reviewedUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_1370bfc5359ac6a0d8b744e9f88"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_f9238c3e3739dc40322f577fc46"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_c88d2686339ad6d166620b741a6"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_4353be8309ce86650def2f8572d"`);
        await queryRunner.query(`ALTER TABLE "gallery_photos" DROP CONSTRAINT "FK_64ef1ba71edc7bffec2348eeefa"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP TABLE "reports"`);
        await queryRunner.query(`DROP TYPE "public"."reports_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."reports_category_enum"`);
        await queryRunner.query(`DROP TABLE "waitlist"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "gallery_photos"`);
    }

}
