type Props = {
  status: string;
};

export default function ApplicationTimeline({ status }: Props) {
  return (
    <div className="space-y-4 mt-8">

      <div className="flex items-center gap-3">
        <span className="text-2xl">📝</span>
        <span className="font-medium">Application Submitted</span>
      </div>

      <div className="ml-3 border-l-2 border-gray-300 h-8"></div>

      <div className="flex items-center gap-3">
        <span className="text-2xl">👮</span>
        <span className="font-medium">Under Review</span>
      </div>

      {(status === "Approved" || status === "Rejected") && (
        <>
          <div className="ml-3 border-l-2 border-gray-300 h-8"></div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {status === "Approved" ? "✅" : "❌"}
            </span>

            <span className="font-bold">
              {status}
            </span>
          </div>
        </>
      )}

    </div>
  );
}