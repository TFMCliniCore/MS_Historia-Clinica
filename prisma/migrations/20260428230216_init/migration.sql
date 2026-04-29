-- CreateTable
CREATE TABLE "historias_clinicas" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "sucursalId" INTEGER NOT NULL,
    "motivo" VARCHAR(500) NOT NULL,
    "sintomas" VARCHAR(1000),
    "diagnostico" VARCHAR(1000),
    "tratamiento" VARCHAR(1000),
    "notas" VARCHAR(1000),
    "costo" DECIMAL(10,2),
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "formaPago" VARCHAR(50),
    "eliminado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historias_clinicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adjuntos" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "historiaClinicaId" INTEGER,
    "nombreArchivo" VARCHAR(500) NOT NULL,
    "nombreOriginal" VARCHAR(500) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "descripcion" VARCHAR(300),
    "eliminado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adjuntos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "adjuntos" ADD CONSTRAINT "adjuntos_historiaClinicaId_fkey" FOREIGN KEY ("historiaClinicaId") REFERENCES "historias_clinicas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
