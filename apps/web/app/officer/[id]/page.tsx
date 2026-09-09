import { prisma } from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { redirect, notFound } from "next/navigation";
import ApplicationActions from "../../../components/ApplicationActions";
import AuditHistory from "../../../components/AuditHistory";

export default async function ApplicationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || (user.role !== "officer" && user.role !== "admin")) redirect("/dashboard");

  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: {
      id,
    },
    include: {
     residenceJourney: {
  include: {
    steps: {
      orderBy: { percentage: "asc" },
    },
    medical: true,
    payments: {
      orderBy: { createdAt: "desc" },
    },
    immigration: true,
    auditLogs: {
      orderBy: {
        createdAt: "desc",
      },
      include: {
        officer: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    },
  },
},
    },
  });

  if (!application) {
    notFound();
  }

  const journey = application.residenceJourney;

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Application information */}

        <div className="bg-white rounded-xl shadow-xl p-8">

          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">
                Immigration Application
              </h1>

              <p className="text-gray-500 mt-1">
                Officer review and residence journey
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">
                Application ID
              </p>

              <p className="font-bold text-blue-900">
                {application.applicationId}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-8">

            <p>
              <strong>Full Name:</strong>{" "}
              {application.fullName}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {application.email}
            </p>

            <p>
              <strong>Nationality:</strong>{" "}
              {application.nationality}
            </p>

            <p>
              <strong>Passport Number:</strong>{" "}
              {application.passportNumber}
            </p>

            <p>
              <strong>Purpose:</strong>{" "}
              {application.purpose}
            </p>

            <p>
              <strong>Application Type:</strong>{" "}
              {application.applicationType}
            </p>

            <p>
              <strong>Application Status:</strong>{" "}
              <span className="font-semibold">
                {application.status}
              </span>
            </p>

            <p>
              <strong>Submitted:</strong>{" "}
              {application.createdAt.toLocaleString()}
            </p>

          </div>
        </div>

        {/* Documents */}

        <div className="bg-white rounded-xl shadow-xl p-8">

          <h2 className="text-2xl font-bold text-blue-900">
            Uploaded Documents
          </h2>

          <div className="mt-6 space-y-4">

            <p>
              <strong>Passport Scan:</strong>{" "}
              {application.passportFile ? (
                <a
  href={`/api/applications/${application.id}/documents?type=passport`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-700 hover:underline"
>
  📄 View Passport Scan
</a>
              ) : (
                <span className="text-gray-500">
                  Not uploaded
                </span>
              )}
            </p>

            <p>
              <strong>Passport Photo:</strong>{" "}
              {application.photoFile ? (
                <a
  href={`/api/applications/${application.id}/documents?type=photo`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-700 hover:underline"
>
  📷 View Passport Photo
</a>
              ) : (
                <span className="text-gray-500">
                  Not uploaded
                </span>
              )}
            </p>

            <p>
              <strong>Supporting Document:</strong>{" "}
              {application.supportFile ? (
                <a
  href={`/api/applications/${application.id}/documents?type=support`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-700 hover:underline"
>
  📎 View Supporting Document
</a>
              ) : (
                <span className="text-gray-500">
                  Not uploaded
                </span>
              )}
            </p>

          </div>
        </div>

        {/* Residence Journey */}

        <div className="bg-white rounded-xl shadow-xl p-8">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-bold text-blue-900">
                Residence Journey
              </h2>

              <p className="text-gray-500 mt-1">
                Officer processing workflow
              </p>
            </div>

            <div className="text-right">

              <p className="text-4xl font-bold text-blue-900">
                {journey?.percentage ?? 0}%
              </p>

              <p className="text-sm text-gray-500">
                Completion
              </p>

            </div>

          </div>

          {/* Progress bar */}

          <div className="mt-6">

            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">

              <div
                className="h-full bg-blue-700 transition-all duration-500"
                style={{
                  width: `${journey?.percentage ?? 0}%`,
                }}
              />

            </div>

          </div>

          {/* Steps */}

          <div className="mt-8 space-y-4">

            {journey?.steps.map((step) => {

              const completed =
                step.status === "COMPLETED";

              const inProgress =
                step.status === "IN_PROGRESS";

              return (
                <div
                  key={step.id}
                  className={`border rounded-xl p-5 ${
                    completed
                      ? "border-green-300 bg-green-50"
                      : inProgress
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="font-bold text-lg">
                        {step.step.replaceAll("_", " ")}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {step.percentage}% milestone
                      </p>

                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        completed
                          ? "bg-green-600 text-white"
                          : inProgress
                          ? "bg-blue-600 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {step.status}
                    </span>

                  </div>

                </div>
              );
            })}

          </div>

          {/* Medical */}

          <div className="mt-8 border-t pt-6">

            <h3 className="text-xl font-bold text-blue-900">
              Medical Verification
            </h3>

            <div className="mt-3">

              <p>
                <strong>Status:</strong>{" "}
                {journey?.medical?.status ?? "PENDING"}
              </p>

              {journey?.medical?.hospital && (
                <p>
                  <strong>Hospital:</strong>{" "}
                  {journey.medical.hospital}
                </p>
              )}

            </div>

          </div>

          {/* Payments */}

          <div className="mt-8 border-t pt-6">

            <h3 className="text-xl font-bold text-blue-900">
              Payments
            </h3>

            {journey?.payments.length ? (
              <div className="mt-4 space-y-3">

                {journey.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border rounded-lg p-4"
                  >

                    <div className="flex justify-between">

                      <span className="font-semibold">
                        {payment.type}
                      </span>

                      <span className="font-bold">
                        {payment.amount} {payment.currency}
                      </span>

                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      Status: {payment.status}
                    </p>

                    {payment.reference && (
                      <p className="text-sm text-gray-500">
                        Reference: {payment.reference}
                      </p>
                    )}

                  </div>
                ))}

              </div>
            ) : (
              <p className="text-gray-500 mt-3">
                No payment recorded.
              </p>
            )}

          </div>

          {/* Immigration */}

          <div className="mt-8 border-t pt-6">

            <h3 className="text-xl font-bold text-blue-900">
              Immigration Review
            </h3>

            <p className="mt-3">
              <strong>Status:</strong>{" "}
              {journey?.immigration?.status ?? "PENDING"}
            </p>

            {journey?.immigration?.decision && (
              <p>
                <strong>Decision:</strong>{" "}
                {journey.immigration.decision}
              </p>
            )}

          </div>

        </div>

        {/* Officer Actions */}

        <div className="bg-white rounded-xl shadow-xl p-8">

          <h2 className="text-2xl font-bold text-blue-900">
            Officer Actions
          </h2>

          <p className="text-gray-500 mt-1">
            Advance this application through the immigration workflow.
          </p>

          <div className="mt-6">
            <ApplicationActions
              id={application.id}
              journey={journey}
            />
          </div>

        </div>
        {journey && (
  <AuditHistory logs={journey.auditLogs} />
)}

      </div>
    </main>
  );
}