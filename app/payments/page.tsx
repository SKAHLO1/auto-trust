"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Loader, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Payment {
  id: string
  taskId: string
  taskTitle: string
  amount: number
  type: 'received' | 'sent' | 'refunded'
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  txId?: string
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const data = await api.getPaymentHistory()
      setPayments(data)
    } catch (error: any) {
      toast.error("Failed to load payment history")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getPaymentIcon = (type: Payment['type']) => {
    switch (type) {
      case 'received':
        return <ArrowDownRight className="w-5 h-5 text-green-500" />
      case 'sent':
        return <ArrowUpRight className="w-5 h-5 text-blue-500" />
      case 'refunded':
        return <ArrowDownRight className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500'
      case 'pending':
        return 'text-yellow-500'
      case 'failed':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Payment History</h1>
          <p className="text-muted-foreground">
            View all your past transactions and escrow payments
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Total Received</span>
              <ArrowDownRight className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold">
              {payments
                .filter(p => p.type === 'received' && p.status === 'completed')
                .reduce((sum, p) => sum + p.amount, 0)} MNEE
            </p>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Total Sent</span>
              <ArrowUpRight className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">
              {payments
                .filter(p => p.type === 'sent' && p.status === 'completed')
                .reduce((sum, p) => sum + p.amount, 0)} MNEE
            </p>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Pending</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold">
              {payments
                .filter(p => p.status === 'pending')
                .reduce((sum, p) => sum + p.amount, 0)} MNEE
            </p>
          </Card>
        </div>

        {/* Payment List */}
        <Card className="bg-card border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
          </div>
          
          {payments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No payment history yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {payments.map((payment) => (
                <Link
                  key={payment.id}
                  href={`/tasks/${payment.taskId}`}
                  className="block hover:bg-card/50 transition"
                >
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center border border-border">
                        {getPaymentIcon(payment.type)}
                      </div>
                      <div>
                        <p className="font-semibold">{payment.taskTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        {payment.txId && (
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            TX: {payment.txId.slice(0, 16)}...
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {payment.type === 'sent' ? '-' : '+'}
                        {payment.amount} MNEE
                      </p>
                      <p className={`text-sm capitalize ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
