import { CheckCircle, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'

interface SuccessCardProps {
  title: string
  description: string
  transactionHash?: string
  explorerUrl?: string
  onClose?: () => void
}

export function SuccessCard({ 
  title, 
  description, 
  transactionHash, 
  explorerUrl,
  onClose 
}: SuccessCardProps) {
  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <CardTitle className="text-green-800 dark:text-green-200">{title}</CardTitle>
        </div>
        <CardDescription className="text-green-700 dark:text-green-300">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-3">
          {transactionHash && (
            <div className="text-sm">
              <span className="font-medium text-green-800 dark:text-green-200">Transaction Hash:</span>
              <div className="font-mono text-xs text-green-600 dark:text-green-400 break-all">
                {transactionHash}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            {explorerUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(explorerUrl, '_blank')}
                className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View on Etherscan
              </Button>
            )}
            
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-green-600 hover:text-green-800 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-200 dark:hover:bg-green-900"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}