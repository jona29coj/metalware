-- CreateTable
CREATE TABLE "ColdWaterStorage" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "chargingEnergy" DOUBLE PRECISION NOT NULL,
    "dischargingEnergy" DOUBLE PRECISION NOT NULL,
    "storedTemp" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ColdWaterStorage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotWaterStorage" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "chargingEnergy" DOUBLE PRECISION NOT NULL,
    "dischargingEnergy" DOUBLE PRECISION NOT NULL,
    "storedTemp" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HotWaterStorage_pkey" PRIMARY KEY ("id")
);
