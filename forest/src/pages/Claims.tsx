import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { forestRegions, sampleClaims, calculateCC, INCOME_PER_ACRE, type ClaimData } from "@/data/forestRegions";
import { FileCheck, Plus, IndianRupee, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRegion } from "@/context/RegionContext";

export default function Claims() {
  const { activeRegion } = useRegion();
  const [claims, setClaims] = useState<ClaimData[]>(sampleClaims);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    regionId: activeRegion?.id || "",
    claimantName: "",
    areaClaimed: "",
    year: "2024",
  });
  const [filterRegion, setFilterRegion] = useState<string>(activeRegion?.id || "all");
  const { toast } = useToast();

  // Sync form and filter when activeRegion changes
  useEffect(() => {
    if (activeRegion) {
      setForm(prev => ({ ...prev, regionId: activeRegion.id }));
      setFilterRegion(activeRegion.id);
    }
  }, [activeRegion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClaim: ClaimData = {
      id: `CLM${String(claims.length + 1).padStart(3, "0")}`,
      regionId: form.regionId,
      claimantName: form.claimantName,
      areaClaimed: Number(form.areaClaimed),
      status: "Pending",
      year: Number(form.year),
      dateSubmitted: new Date().toISOString().split("T")[0],
    };
    setClaims([newClaim, ...claims]);
    setOpen(false);
    setForm({ regionId: activeRegion?.id || "", claimantName: "", areaClaimed: "", year: "2024" });
    toast({ title: "Claim Submitted", description: `Claim ${newClaim.id} submitted for review.` });
  };

  const getRegionName = (id: string) => forestRegions.find(r => r.id === id)?.vanVibhag || id;

  const statusColor = (s: string): "default" | "secondary" | "destructive" | "outline" =>
    s === "Issued" ? "default" : s === "Approved" ? "secondary" : s === "Pending" ? "outline" : "destructive";

  const filteredClaims = filterRegion === "all" ? claims : claims.filter(c => c.regionId === filterRegion);

  const totalClaimed = filteredClaims.reduce((s, c) => s + c.areaClaimed, 0);
  const totalIncome = totalClaimed * INCOME_PER_ACRE;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Carbon Credit Claims
            {activeRegion && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {activeRegion.vanVibhag}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Submit and track forest carbon credit claims</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Filter by region */}
          <Select value={filterRegion} onValueChange={setFilterRegion}>
            <SelectTrigger className="w-52 bg-card">
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {forestRegions.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.vanVibhag}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> New Claim</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Submit New Carbon Credit Claim</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Forest Region</Label>
                  <Select value={form.regionId} onValueChange={v => setForm({ ...form, regionId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                    <SelectContent>
                      {forestRegions.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.vanVibhag} — {r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Claimant / Officer Name</Label>
                  <Input value={form.claimantName} onChange={e => setForm({ ...form, claimantName: e.target.value })} required />
                </div>
                <div>
                  <Label>Area Claimed (Acres)</Label>
                  <Input type="number" value={form.areaClaimed} onChange={e => setForm({ ...form, areaClaimed: e.target.value })} required />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} required />
                </div>
                {form.areaClaimed && (
                  <Card className="border-none bg-secondary">
                    <CardContent className="pt-4 flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        Estimated Income: <strong>₹{(Number(form.areaClaimed) * INCOME_PER_ACRE).toLocaleString()}</strong>
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({calculateCC(Number(form.areaClaimed)).credits.toLocaleString()} credits)
                      </span>
                    </CardContent>
                  </Card>
                )}
                <Button type="submit" className="w-full" disabled={!form.regionId || !form.claimantName || !form.areaClaimed}>
                  Submit Claim
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Claims</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{filteredClaims.length}</div></CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Area Claimed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalClaimed.toLocaleString()} acres</div></CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Income Potential</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{(totalIncome / 1e6).toFixed(1)}M</div></CardContent>
        </Card>
      </div>

      {/* Claims Table */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" /> Claims Register
            {filterRegion !== "all" && (
              <Badge variant="outline">{getRegionName(filterRegion)}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Claimant</TableHead>
                <TableHead>Area (Acres)</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.map(claim => (
                <TableRow key={claim.id}>
                  <TableCell className="font-mono text-sm">{claim.id}</TableCell>
                  <TableCell>{getRegionName(claim.regionId)}</TableCell>
                  <TableCell>{claim.claimantName}</TableCell>
                  <TableCell>{claim.areaClaimed.toLocaleString()}</TableCell>
                  <TableCell>{calculateCC(claim.areaClaimed).credits.toLocaleString()}</TableCell>
                  <TableCell>{claim.year}</TableCell>
                  <TableCell><Badge variant={statusColor(claim.status)}>{claim.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{claim.dateSubmitted}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
