"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Pencil, Trash2, Star } from "lucide-react"

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

import { Testimonial } from "@/types/testimonial"
import api from "@/lib/api"
import DeleteConfirmDialog from "@/components/common/DeleteModal"

const EMPTY_FORM = { name: "", role: "", message: "", rating: "" }

type DialogState =
  | { mode: "add" }
  | { mode: "edit"; testimonial: Testimonial }
  | null

/* ── Avatar ── */
const Avatar = ({ name, image, large }: { name: string; image?: string; large?: boolean }) => {
  const size = large ? "h-12 w-12" : "h-9 w-9"
  return image ? (
    <img src={image} alt={name} className={`${size} rounded-full object-cover flex-shrink-0`} />
  ) : (
    <div
      className={`${size} rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0`}
      style={{
        background: "color-mix(in oklch, var(--color-primary) 12%, white)",
        color: "var(--color-primary)",
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

/* ── Inline rating ── */
const InlineRating = ({ rating }: { rating: number }) => (
  <span className="flex items-center gap-1 text-sm font-medium text-amber-500">
    <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
    {rating}
  </span>
)

/* ── Mobile Card ── */
const TestimonialCard = ({
  t,
  onEdit,
  onDelete,
}: {
  t: Testimonial
  onEdit: (t: Testimonial) => void
  onDelete: (t: Testimonial) => void
}) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 shadow-sm">
    {/* Top row: avatar + name + actions */}
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={t.name} image={t.image} />
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{t.name}</p>
          {t.role && <p className="text-xs text-gray-400 truncate">{t.role}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => onEdit(t)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(t)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>

    {/* Message */}
    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{t.message}</p>

    {/* Rating */}
    {t.rating && (
      <div className="pt-1 border-t border-gray-50">
        <InlineRating rating={Number(t.rating)} />
      </div>
    )}
  </div>
)

/* ── Page ── */
export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading]           = useState(true)
  const [dialog, setDialog]             = useState<DialogState>(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [imageFile, setImageFile]       = useState<File | null>(null)
  const [preview, setPreview]           = useState("")
  const [saving, setSaving]             = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null)
  const [deleting, setDeleting]         = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  /* ── Fetch ── */
  const fetchTestimonials = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/api/admin/testimonials")
      setTestimonials(data.testimonials ?? [])
    } catch {
      toast.error("Failed to fetch testimonials")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTestimonials() }, [fetchTestimonials])

  /* ── Dialog helpers ── */
  const openAdd = useCallback(() => {
    setForm(EMPTY_FORM)
    setImageFile(null)
    setPreview("")
    setDialog({ mode: "add" })
  }, [])

  const openEdit = useCallback((t: Testimonial) => {
    setForm({ name: t.name, role: t.role ?? "", message: t.message, rating: String(t.rating ?? "") })
    setImageFile(null)
    setPreview(t.image ?? "")
    setDialog({ mode: "edit", testimonial: t })
  }, [])

  const closeDialog = useCallback(() => setDialog(null), [])
  const patchForm   = useCallback(
    (patch: Partial<typeof EMPTY_FORM>) => setForm((f) => ({ ...f, ...patch })),
    []
  )

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }, [])

  /* ── Save (optimistic) ── */
  const handleSave = useCallback(async () => {
    if (!form.name.trim())    return toast.error("Name is required")
    if (!form.message.trim()) return toast.error("Message is required")

    const fd = new FormData()
    fd.append("name", form.name.trim())
    fd.append("message", form.message.trim())
    if (form.role.trim()) fd.append("role", form.role.trim())
    if (form.rating)      fd.append("rating", form.rating)
    if (imageFile)        fd.append("image", imageFile)

    setSaving(true)
    try {
      if (dialog?.mode === "edit") {
        const { data } = await api.put(`/api/admin/testimonials/${dialog.testimonial._id}`, fd)
        setTestimonials((prev) =>
          prev.map((t) => (t._id === dialog.testimonial._id ? data.testimonial ?? t : t))
        )
        toast.success("Testimonial updated")
      } else {
        const { data } = await api.post("/api/admin/testimonials", fd)
        setTestimonials((prev) => [data.testimonial, ...prev])
        toast.success("Testimonial created")
      }
      closeDialog()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Something went wrong")
    } finally {
      setSaving(false)
    }
  }, [form, imageFile, dialog, closeDialog])

  /* ── Delete (optimistic) ── */
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/api/admin/testimonials/${deleteTarget._id}`)
      setTestimonials((prev) => prev.filter((t) => t._id !== deleteTarget._id))
      toast.success("Testimonial deleted")
      setDeleteTarget(null)
    } catch {
      toast.error("Failed to delete testimonial")
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget])

  /* ── Shared empty state ── */
  const EmptyState = () => (
    <div className="flex flex-col items-center gap-2 py-16">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: "color-mix(in oklch, var(--color-primary) 8%, white)" }}
      >
        <span className="text-2xl">💬</span>
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
        No testimonials yet
      </p>
      <p className="text-xs text-gray-400">Add your first testimonial to get started</p>
    </div>
  )

  /* ── Render ── */
  return (
    <>
      <div className="max-w-screen-xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: "var(--color-primary)" }}>
              Testimonials
            </p>
            <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)", opacity: 0.7 }}>
              Manage community testimonials shown on the homepage
            </p>
          </div>
          <Button onClick={openAdd} className="w-full sm:w-fit button cursor-pointer">
            + Add Testimonial
          </Button>
        </div>

        {/* ── MOBILE: card list (hidden on md+) ── */}
        <div className="md:hidden space-y-3">
          {/* Card header badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ background: "var(--color-accent)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                All Testimonials
              </p>
            </div>
            <span
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{
                background: "color-mix(in oklch, var(--color-primary) 8%, white)",
                color: "var(--color-primary)",
              }}
            >
              {testimonials.length} total
            </span>
          </div>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))
          ) : testimonials.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100">
              <EmptyState />
            </div>
          ) : (
            testimonials.map((t) => (
              <TestimonialCard
                key={t._id}
                t={t}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))
          )}
        </div>

        {/* ── DESKTOP: table (hidden on mobile) ── */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Card header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full" style={{ background: "var(--color-accent)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                All Testimonials
              </p>
            </div>
            <span
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{
                background: "color-mix(in oklch, var(--color-primary) 8%, white)",
                color: "var(--color-primary)",
              }}
            >
              {testimonials.length} total
            </span>
          </div>

          <div className="p-4">
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow
                    className="border-b border-gray-100"
                    style={{ background: "color-mix(in oklch, var(--color-primary) 4%, white)" }}
                  >
                    {["Person", "Role", "Message", "Rating", "Actions"].map((h, i) => (
                      <TableHead
                        key={h}
                        className={`text-xs font-semibold uppercase tracking-wide py-3 ${i === 4 ? "text-right" : ""}`}
                        style={{ color: "var(--color-primary)" }}
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i} className="border-b border-gray-50">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : testimonials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyState />
                      </TableCell>
                    </TableRow>
                  ) : (
                    testimonials.map((t) => (
                      <TableRow key={t._id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={t.name} image={t.image} />
                            <span className="font-medium text-sm">{t.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 py-3">{t.role || "—"}</TableCell>
                        <TableCell className="text-sm text-gray-600 py-3 max-w-xs">
                          <p className="line-clamp-2">{t.message}</p>
                        </TableCell>
                        <TableCell className="py-3">
                          {t.rating ? <InlineRating rating={Number(t.rating)} /> : "—"}
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(t)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={!!dialog} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg rounded-2xl bg-white border-0 shadow-none ring-0 outline-none">
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === "edit" ? "Edit Testimonial" : "Add Testimonial"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Photo */}
            <div className="space-y-2">
              <Label>Photo (optional)</Label>
              {preview && (
                <img src={preview} alt="preview" className="h-16 w-16 rounded-full object-cover" />
              )}
              <Input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange} />
            </div>

            {/* Name + Role — stack on mobile, side-by-side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Ahmed Shaikh"
                  value={form.name} onChange={(e) => patchForm({ name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Role / Designation</Label>
                <Input placeholder="e.g. Community Elder"
                  value={form.role} onChange={(e) => patchForm({ role: e.target.value })} />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label>Message <span className="text-destructive">*</span></Label>
              <Textarea
                className="resize-none"
                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                placeholder="Write testimonial message..."
                rows={4}
                value={form.message}
                onChange={(e) => patchForm({ message: e.target.value })}
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating (1–5)</Label>
              <Input type="number" min={1} max={5} placeholder="e.g. 5"
                value={form.rating} onChange={(e) => patchForm({ rating: e.target.value })} />
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:flex-row">
            <Button className="button cursor-pointer flex-1 sm:flex-none" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              className="bg-(--color-primary)/80 text-white hover:scale-105 transition cursor-pointer flex-1 sm:flex-none"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : dialog?.mode === "edit" ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Testimonial?"
        description={`"${deleteTarget?.name}" ka testimonial permanently delete ho jayega.`}
      />
    </>
  )
}