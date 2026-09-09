import { prisma } from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { redirect, notFound } from "next/navigation";
import ApplicationDetailsClient from "../../../components/ApplicationDetailsClient";

export default async function ApplicationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      residenceJourney: {
        include: {
          payments: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!application) {
    notFound();
  }

  if (application.user?.email !== session.user.email) {
    redirect("/applications");
  }

  return (
    <ApplicationDetailsClient
      application={{
        id: application.id,
        applicationId: application.applicationId,
        fullName: application.fullName,
        email: application.email,
        nationality: application.nationality,
        passportNumber: application.passportNumber,
        purpose: application.purpose,
        status: application.status,
        createdAt: application.createdAt.toISOString(),
        residenceJourney: application.residenceJourney
          ? {
              percentage: application.residenceJourney.percentage,
              payments: application.residenceJourney.payments.map(
                (payment) => ({
                  id: payment.id,
                  type: payment.type,
                  amount: payment.amount,
                  currency: payment.currency,
                  status: payment.status,
                  reference: payment.reference,
                  paidAt: payment.paidAt
                    ? payment.paidAt.toISOString()
                    : null,
                  verifiedAt: payment.verifiedAt
                    ? payment.verifiedAt.toISOString()
                    : null,
                })
              ),
            }
          : null,
      }}
    />
  );
}