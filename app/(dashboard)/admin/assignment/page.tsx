"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function SubmissionTable() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch submissions
  const fetchSubmissions = async () => {
    try {
      const res = await api.get("/api/admin/submissions");
      setSubmissions(res.data?.data || []);
    } catch (err: any) {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchSubmissions();
  }, []);

  // 🔹 Delete
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/admin/submissions/${id}`);
      setSubmissions((prev) => prev.filter((item) => item._id !== id));
      toast.success("Deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  // 🔹 Open Review
  const handleReview = (item: any) => {
    setSelected(item);
  };

  // 🔹 Mark Reviewed
  const markReviewed = async (id: string) => {
    try {
      await api.patch(`/api/admin/submissions/${id}`, {
        status: "REVIEWED",
      });

      setSubmissions((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: "REVIEWED" } : item
        )
      );

      toast.success("Marked as reviewed");
      setSelected(null);
    } catch {
      toast.error("Failed to update");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Assignment Submissions</h1>

      {/* TABLE */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Course</th>
              <th className="p-3">File</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {submissions.map((item) => (
              <tr key={item._id} className="border-t">
                <td className="p-3">{item.user?.name}</td>
                <td className="p-3">{item.course?.title}</td>

                {/* Download */}
                <td className="p-3">
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    className="text-blue-500 underline"
                  >
                    Download
                  </a>
                </td>

                {/* Status */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      item.status === "REVIEWED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleReview(item)}
                    disabled={item.status === "REVIEWED"}
                    className={`px-3 py-1 rounded text-white ${
                      item.status === "REVIEWED"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500"
                    }`}
                  >
                    Review
                  </button>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* REVIEW MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">

            <h2 className="text-lg font-semibold">Review Submission</h2>

            {/* Description */}
            <div>
              <p className="text-sm text-gray-600">
                {selected.description || "No description provided"}
              </p>
            </div>

            {/* File */}
            <a
              href={selected.fileUrl}
              target="_blank"
              className="text-blue-500 underline text-sm"
            >
              Download File
            </a>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-1 border rounded"
              >
                Close
              </button>

              <button
                onClick={() => markReviewed(selected._id)}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                Mark Reviewed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}