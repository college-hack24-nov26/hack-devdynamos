import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Clock, XCircle, ExternalLink, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import blockchainService, { type BlockchainTransaction } from '@/services/blockchainService'

interface TransactionStatusProps {
  transactionHash?: string
  onClose?: () => void
}

const TransactionStatus = ({ transactionHash, onClose }: TransactionStatusProps) => {
  const [transaction, setTransaction] = useState<BlockchainTransaction | null>(null)

  useEffect(() => {
    if (transactionHash) {
      const tx = blockchainService.getTransaction(transactionHash)
      setTransaction(tx || null)

      // Poll for transaction updates
      const interval = setInterval(() => {
        const updatedTx = blockchainService.getTransaction(transactionHash)
        if (updatedTx) {
          setTransaction(updatedTx)
          if (updatedTx.status !== 'pending') {
            clearInterval(interval)
          }
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [transactionHash])

  if (!transaction) return null

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin text-warning" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'pending':
        return 'text-warning border-warning/20 bg-warning/5'
      case 'success':
        return 'text-success border-success/20 bg-success/5'
      case 'failed':
        return 'text-destructive border-destructive/20 bg-destructive/5'
      default:
        return 'text-muted-foreground border-border'
    }
  }

  const getStatusText = () => {
    switch (transaction.status) {
      case 'pending':
        return 'Transaction Pending'
      case 'success':
        return 'Transaction Successful'
      case 'failed':
        return 'Transaction Failed'
      default:
        return 'Unknown Status'
    }
  }

  const getActionText = () => {
    if (transaction.type === 'approve') {
      return transaction.status === 'success' ? 'Project Approved' : 'Approving Project'
    } else if (transaction.type === 'mint') {
      return transaction.status === 'success' ? 'Credits Minted' : 'Minting Credits'
    }
    return 'Processing'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Card className="w-80 shadow-lg border-2">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="font-semibold">{getActionText()}</span>
              </div>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Badge variant="outline" className={getStatusColor()}>
                {getStatusText()}
              </Badge>

              <div className="text-sm text-muted-foreground">
                <p>Project: {transaction.projectId}</p>
                {transaction.amount && (
                  <p>Amount: {transaction.amount} CC</p>
                )}
                <p className="font-mono text-xs">
                  {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(blockchainService.getExplorerUrl(transaction.hash), '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View on Explorer
                </Button>
              </div>
            </div>

            {transaction.status === 'pending' && (
              <div className="mt-3">
                <div className="w-full bg-muted rounded-full h-1">
                  <motion.div
                    className="bg-warning h-1 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 30, ease: 'linear' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Waiting for blockchain confirmation...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

export default TransactionStatus