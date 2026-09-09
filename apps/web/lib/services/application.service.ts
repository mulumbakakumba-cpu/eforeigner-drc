import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";

export async function createApplication(data: {
  applicationId: string;
  idempotencyKey?: string;
  fullName: string;
  email: string;
  nationality: string;
  passportNumber: string;
  purpose: string;
  birthDate?: Date;
  arrivalDate?: Date;
  userId?: string;
  passportFile?: string;
  photoFile?: string;
  supportFile?: string;
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      if (data.idempotencyKey) {
        const existingApplication = await tx.application.findUnique({
          where: {
            idempotencyKey: data.idempotencyKey,
          },
          include: {
            residenceJourney: {
              include: {
                steps: true,
                medical: true,
                payments: true,
                immigration: true,
              },
            },
          },
        });

        if (existingApplication) {
          return {
            application: existingApplication,
            journey: existingApplication.residenceJourney,
            created: false,
          };
        }
      }

      const application = await tx.application.create({
        data: {
          applicationId: data.applicationId,
          idempotencyKey: data.idempotencyKey,
          fullName: data.fullName,
          email: data.email,
          nationality: data.nationality,
          passportNumber: data.passportNumber,
          purpose: data.purpose,
          birthDate: data.birthDate,
          arrivalDate: data.arrivalDate,
          userId: data.userId,
          passportFile: data.passportFile,
          photoFile: data.photoFile,
          supportFile: data.supportFile,
        },
      });

      const journey = await tx.residenceJourney.create({
        data: {
          applicationId: application.id,
          percentage: 20,
          currentStep: "ACCOUNT_CREATED",
          status: "IN_PROGRESS",
          steps: {
            create: [
              {
                step: "ACCOUNT_CREATED",
                percentage: 20,
                status: "COMPLETED",
                startedAt: new Date(),
                completedAt: new Date(),
              },
              {
                step: "PROFILE_COMPLETED",
                percentage: 40,
                status: "PENDING",
              },
              {
                step: "MEDICAL_VERIFIED",
                percentage: 60,
                status: "PENDING",
              },
              {
                step: "PAYMENT_VERIFIED",
                percentage: 80,
                status: "PENDING",
              },
              {
                step: "IMMIGRATION_APPROVED",
                percentage: 100,
                status: "PENDING",
              },
            ],
          },
          medical: {
            create: {
              status: "PENDING",
            },
          },
          immigration: {
            create: {
              status: "PENDING",
            },
          },
        },
        include: {
          steps: true,
          medical: true,
          payments: true,
          immigration: true,
        },
      });

      return {
        application,
        journey,
        created: true,
      };
    });
  } catch (error) {
    if (
      data.idempotencyKey &&
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existingApplication = await prisma.application.findUnique({
        where: {
          idempotencyKey: data.idempotencyKey,
        },
        include: {
          residenceJourney: {
            include: {
              steps: true,
              medical: true,
              payments: true,
              immigration: true,
            },
          },
        },
      });

      if (existingApplication) {
        return {
          application: existingApplication,
          journey: existingApplication.residenceJourney,
          created: false,
        };
      }
    }

    throw error;
  }
}
export async function getApplication(applicationId: string) {
  return prisma.application.findUnique({
    where: {
      applicationId,
    },
    include: {
      residenceJourney: {
        include: {
          steps: true,
          medical: true,
          payments: true,
          immigration: true,
        },
      },
    },
  });
}

export async function getApplications() {
  return prisma.application.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      residenceJourney: {
        include: {
          steps: true,
          medical: true,
          payments: true,
          immigration: true,
        },
      },
    },
  });
}

export async function updateApplicationStatus(
  id: string,
  status: string
) {
  return prisma.application.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function getApplicationsByUser(userId: string) {
  return prisma.application.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      residenceJourney: {
        include: {
          steps: true,
          medical: true,
          payments: true,
          immigration: true,
        },
      },
    },
  });
}
export async function advanceResidenceJourney(
  applicationId: string,
  action: string,
  officerEmail: string
) {
  const officer = await prisma.user.findUnique({
    where: {
      email: officerEmail,
    },
  });

  if (!officer) {
    throw new Error("Officer not found.");
  }

  if (officer.role !== "officer" && officer.role !== "admin") {
    throw new Error("Forbidden.");
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const application = await tx.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        residenceJourney: {
          include: {
            steps: true,
            medical: true,
            payments: true,
            immigration: true,
          },
        },
      },
    });

    if (!application) {
      throw new Error("Application not found.");
    }

    const journey = application.residenceJourney;

    if (!journey) {
      throw new Error("Residence journey not found.");
    }

    switch (action) {
      /*
       * 20% → 40%
       * Validate immigration documents
       */
      case "VALIDATE_DOCUMENTS": {
        if (journey.percentage !== 20) {
          throw new Error(
            "Documents can only be validated when the application is at 20%."
          );
        }

        await tx.journeyStep.update({
          where: {
            journeyId_step: {
              journeyId: journey.id,
              step: "PROFILE_COMPLETED",
            },
          },
          data: {
            status: "COMPLETED",
            completedAt: now,
            verifiedBy: officerEmail,
          },
        });

        await tx.journeyStep.update({
          where: {
            journeyId_step: {
              journeyId: journey.id,
              step: "MEDICAL_VERIFIED",
            },
          },
          data: {
            status: "IN_PROGRESS",
            startedAt: now,
          },
        });
        await tx.journeyAuditLog.create({
  data: {
    applicationId: application.id,
    journeyId: journey.id,
    officerId: officer.id,
    action: "VALIDATE_DOCUMENTS",
    fromStep: "ACCOUNT_CREATED",
    toStep: "MEDICAL_VERIFIED",
    fromPercentage: 20,
    toPercentage: 40,
    notes: "Immigration documents validated by officer.",
  },
});

        return tx.residenceJourney.update({
          where: {
            id: journey.id,
          },
          data: {
            percentage: 40,
            currentStep: "MEDICAL_VERIFIED",
            status: "IN_PROGRESS",
          },
          include: {
            steps: true,
            medical: true,
            payments: true,
            immigration: true,
          },
        });
      }

      /*
       * 40%
       * Officer verifies medical examination
       */
      case "VERIFY_MEDICAL": {
        if (journey.percentage !== 40) {
          throw new Error(
            "Medical verification can only happen at 40%."
          );
        }

        if (!journey.medical) {
          throw new Error(
            "Medical verification record not found."
          );
        }

        await tx.medicalVerification.update({
          where: {
            journeyId: journey.id,
          },
          data: {
            status: "VERIFIED",
            verifiedAt: now,
            verifiedBy: officerEmail,
          },
        });

        await tx.journeyStep.update({
          where: {
            journeyId_step: {
              journeyId: journey.id,
              step: "MEDICAL_VERIFIED",
            },
          },
          data: {
            status: "COMPLETED",
            completedAt: now,
            verifiedBy: officerEmail,
          },
        });

        await tx.journeyStep.update({
          where: {
            journeyId_step: {
              journeyId: journey.id,
              step: "PAYMENT_VERIFIED",
            },
          },
          data: {
            status: "IN_PROGRESS",
            startedAt: now,
          },
        });
        await tx.journeyAuditLog.create({
  data: {
    applicationId: application.id,
    journeyId: journey.id,
    officerId: officer.id,
    action: "VERIFY_MEDICAL",
    fromStep: "MEDICAL_VERIFIED",
    toStep: "PAYMENT_VERIFIED",
    fromPercentage: 40,
    toPercentage: 60,
    notes: "Medical examination verified by officer.",
  },
});

        return tx.residenceJourney.update({
          where: {
            id: journey.id,
          },
          data: {
            percentage: 60,
            currentStep: "PAYMENT_VERIFIED",
            status: "IN_PROGRESS",
          },
          include: {
            steps: true,
            medical: true,
            payments: true,
            immigration: true,
          },
        });
      }

      /*
       * 60% → 80%
       * Verify an existing payment
       */
      case "VERIFY_PAYMENT": {
        if (journey.percentage !== 60) {
          throw new Error(
            "Payment verification can only happen at 60%."
          );
        }

        const payment = journey.payments.find(
  (item) => item.status === "PAID"
);

if (!payment) {
  throw new Error(
    "No paid payment was found for this application. The applicant must complete payment first."
  );
}

        await tx.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: "VERIFIED",
            verifiedAt: now,
            verifiedBy: officerEmail,
          },
        });

        await tx.journeyStep.update({
          where: {
            journeyId_step: {
              journeyId: journey.id,
              step: "PAYMENT_VERIFIED",
            },
          },
          data: {
            status: "COMPLETED",
            completedAt: now,
            verifiedBy: officerEmail,
          },
        });

        await tx.journeyStep.update({
          where: {
            journeyId_step: {
              journeyId: journey.id,
              step: "IMMIGRATION_APPROVED",
            },
          },
          data: {
            status: "IN_PROGRESS",
            startedAt: now,
          },
        });
        await tx.journeyAuditLog.create({
  data: {
    applicationId: application.id,
    journeyId: journey.id,
    officerId: officer.id,
    action: "VERIFY_PAYMENT",
    fromStep: "PAYMENT_VERIFIED",
    toStep: "IMMIGRATION_APPROVED",
    fromPercentage: 60,
    toPercentage: 80,
    notes: "Residence permit payment verified by officer.",
  },
});

        return tx.residenceJourney.update({
          where: {
            id: journey.id,
          },
          data: {
            percentage: 80,
            currentStep: "IMMIGRATION_APPROVED",
            status: "IN_PROGRESS",
          },
          include: {
            steps: true,
            medical: true,
            payments: true,
            immigration: true,
          },
        });
      }

      /*
       * 80% → 100%
       * Final immigration approval
       */
      case "APPROVE_IMMIGRATION": {
        if (journey.percentage !== 80) {
          throw new Error(
            "Immigration approval can only happen at 80%."
          );
        }

        if (!journey.immigration) {
          throw new Error(
            "Immigration review record not found."
          );
        }

        await tx.journeyStep.update({
          where: {
            journeyId_step: {
              journeyId: journey.id,
              step: "IMMIGRATION_APPROVED",
            },
          },
          data: {
            status: "COMPLETED",
            completedAt: now,
            verifiedBy: officerEmail,
          },
        });

        await tx.immigrationReview.update({
          where: {
            journeyId: journey.id,
          },
          data: {
            status: "APPROVED",
            decision: "APPROVED",
            reviewedAt: now,
            reviewedBy: officerEmail,
          },
        });
        await tx.journeyAuditLog.create({
  data: {
    applicationId: application.id,
    journeyId: journey.id,
    officerId: officer.id,
    action: "APPROVE_IMMIGRATION",
    fromStep: "IMMIGRATION_APPROVED",
    toStep: "IMMIGRATION_APPROVED",
    fromPercentage: 80,
    toPercentage: 100,
    notes: "Immigration application approved by officer.",
  },
});

        await tx.application.update({
          where: {
            id: application.id,
          },
          data: {
            status: "Approved",
          },
        });

        return tx.residenceJourney.update({
          where: {
            id: journey.id,
          },
          data: {
            percentage: 100,
            currentStep: "IMMIGRATION_APPROVED",
            status: "COMPLETED",
            completedAt: now,
          },
          include: {
            steps: true,
            medical: true,
            payments: true,
            immigration: true,
          },
        });
      }

      default:
        throw new Error("Invalid journey action.");
    }
  });
}