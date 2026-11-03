import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const WalletConnection = () => {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { toast } = useToast()
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  useEffect(() => {
    setIsCorrectNetwork(chainId === sepolia.id)
  }, [chainId])

  const handleConnect = async () => {
    try {
      // Use the injected connector (MetaMask)
      const injectedConnector = connectors.find(connector => connector.type === 'injected')
      if (injectedConnector) {
        connect({ connector: injectedConnector })
      } else {
        // Fallback to first available connector
        connect({ connector: connectors[0] })
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please make sure MetaMask is installed.",
        variant: "destructive"
      })
    }
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: sepolia.id })
      toast({
        title: "Network Switched",
        description: "Successfully switched to Sepolia testnet",
      })
    } catch (error) {
      toast({
        title: "Network Switch Failed",
        description: "Failed to switch to Sepolia testnet. Please switch manually in MetaMask.",
        variant: "destructive"
      })
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-3">
        <Button 
          onClick={handleConnect} 
          disabled={isPending}
          className="gradient-primary"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isPending ? 'Connecting...' : 'Connect Wallet'}
        </Button>
        <Badge variant="outline" className="text-warning border-warning/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Wallet Required
        </Badge>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className={isCorrectNetwork ? "text-success border-success/20" : "text-warning border-warning/20"}
        >
          {isCorrectNetwork ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Sepolia
            </>
          ) : (
            <>
              <AlertTriangle className="w-3 h-3 mr-1" />
              Wrong Network
            </>
          )}
        </Badge>
        
        <Badge variant="secondary" className="font-mono">
          <Wallet className="w-3 h-3 mr-1" />
          {formatAddress(address!)}
        </Badge>
      </div>

      <div className="flex gap-2">
        {!isCorrectNetwork && (
          <Button 
            onClick={handleSwitchNetwork}
            size="sm"
            variant="outline"
            className="text-warning hover:bg-warning hover:text-warning-foreground"
          >
            Switch to Sepolia
          </Button>
        )}
        
        <Button 
          onClick={() => window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank')}
          size="sm"
          variant="outline"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          View on Explorer
        </Button>
        
        <Button 
          onClick={handleDisconnect}
          size="sm"
          variant="outline"
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          Disconnect
        </Button>
      </div>
    </div>
  )
}

export default WalletConnection