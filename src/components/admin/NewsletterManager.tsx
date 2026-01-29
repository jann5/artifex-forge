import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewsletterManager() {
  const subscribers = useQuery(api.newsletter.listSubscribers);
  const subscriberCount = useQuery(api.newsletter.getSubscriberCount);

  const handleExportCSV = () => {
    if (!subscribers) return;

    const csvContent = [
      ["Email", "Data zapisu"],
      ...subscribers.map(sub => [
        sub.email,
        new Date(sub.subscribedAt).toLocaleDateString('pl-PL')
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyEmails = () => {
    if (!subscribers) return;
    const emails = subscribers.map(sub => sub.email).join(", ");
    navigator.clipboard.writeText(emails);
    alert("Adresy email zostały skopiowane do schowka!");
  };

  if (!subscribers) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Ładowanie subskrybentów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszyscy subskrybenci</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriberCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">Aktywni subskrybenci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ten miesiąc</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscribers.filter(sub => {
                const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
                return sub.subscribedAt > monthAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Nowe zapisy w ciągu 30 dni</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ten tydzień</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscribers.filter(sub => {
                const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                return sub.subscribedAt > weekAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Nowe zapisy w ciągu 7 dni</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Zarządzanie newsletterem</CardTitle>
          <CardDescription>
            Eksportuj adresy email subskrybentów lub skopiuj je do schowka
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Eksportuj CSV
            </Button>
            <Button onClick={handleCopyEmails} variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Kopiuj wszystkie email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista subskrybentów ({subscribers.length})</CardTitle>
          <CardDescription>
            Wszyscy aktywni subskrybenci newslettera
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Brak subskrybentów newslettera
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Data zapisu</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber._id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>
                        {new Date(subscriber.subscribedAt).toLocaleDateString('pl-PL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Aktywny
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
