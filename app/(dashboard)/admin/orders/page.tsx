"use client"

import React, { useEffect, useMemo, useState } from "react"
import api from "@/lib/api"
import { toast } from "sonner"
import { Search } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)

  //  Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)

        const res = await api.get("/api/admin/order")
        setOrders(res.data?.orders || [])

      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to load orders"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // 🔎 Filter Logic
  const filteredOrders = useMemo(() => {
    let result = orders

    // search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (o) =>
          o.user.name.toLowerCase().includes(q) ||
          o.user.email.toLowerCase().includes(q) ||
          o.course.title.toLowerCase().includes(q)
      )
    }

    // status filter
    if (statusFilter !== "ALL") {
      result = result.filter((o) => o.status === statusFilter)
    }

    return result
  }, [orders, search, statusFilter])

  return (
    <div className="w-full space-y-6 px-3 sm:px-4 lg:px-0">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Manage all platform orders.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            View and track all transactions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">

          {/* Filters */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-9 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="border rounded-xl px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {/* Table */}
          <div className="rounded-xl border overflow-hidden">
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[700px]">

                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}>
                          <Skeleton className="h-10 w-full rounded-xl" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order._id}>

                        {/* User */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {order.user.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {order.user.email}
                            </span>
                          </div>
                        </TableCell>

                        {/* Course */}
                        <TableCell>
                          {order.course.title}
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
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
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