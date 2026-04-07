"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { toast } from "sonner"
import { Search } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Skeleton } from "@/components/ui/skeleton"
import { Order } from "@/types/order"


export default function Page() {
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)

        const res = await api.get("/api/user/payments")
        setOrders(res.data?.orders || [])

      } catch (error: any) {
        toast.error("Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // 🔎 Filter
  const filteredOrders = orders.filter((o) =>
    o.course.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full space-y-6 px-3 sm:px-4 lg:px-0">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <p className="text-sm text-muted-foreground">
          View your purchased courses.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            Your purchase history
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">

          {/* Search */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-9 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="rounded-xl border overflow-hidden">
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[700px]">

                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4}>
                          <Skeleton className="h-10 w-full rounded-xl" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order._id}>

                        {/* Course */}
                        <TableCell className="font-medium">
                          {order.course?.title}
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="font-semibold">
                          ₹{order.amount}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium
                              ${order.status === "SUCCESS" && "bg-green-100 text-green-700"}
                              ${order.status === "FAILED" && "bg-red-100 text-red-700"}
                              ${order.status === "PENDING" && "bg-yellow-100 text-yellow-700"}
                            `}
                          >
                            {order.status}
                          </span>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>

                      </TableRow>
                    ))
                  )}
                </TableBody>

              </Table>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}