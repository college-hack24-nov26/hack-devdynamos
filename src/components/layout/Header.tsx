import { Bell, Search, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import WalletConnection from '@/components/blockchain/WalletConnection';

const Header = () => {
  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects, farmers, regions..." 
            className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
          />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Wallet Connection */}
          <WalletConnection />

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {/* User */}
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium">Admin Officer</p>
              <p className="text-xs text-muted-foreground">Central Govt.</p>
            </div>
            <div className="w-10 h-10 rounded-xl gradient-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-secondary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
