import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, ShoppingCart, DollarSign, Users, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

export default function AnalyticsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const analytics = useQuery(api.orders.getAnalytics);
  const productStats = useQuery(api.products.getStats);

  if (isLoading) return null;
  
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Brak dostępu. Wymagane uprawnienia administratora.</p>
      </div>
    );
  }

  if (!analytics || !productStats) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Całkowity Przychód",
      value: `${analytics.totalRevenue.toFixed(2)} PLN`,
      icon: DollarSign,
      description: `+${analytics.revenueGrowth.toFixed(1)}% vs poprzedni miesiąc`,
      color: "text-green-500"
    },
    {
      title: "Zamówienia",
      value: analytics.totalOrders,
      icon: ShoppingCart,
      description: `${analytics.pendingOrders} oczekujących`,
      color: "text-blue-500"
    },
    {
      title: "Produkty",
      value: productStats.totalProducts,
      icon: Package,
      description: `${productStats.lowStockCount} niski stan`,
      color: "text-purple-500"
    },
    {
      title: "Średnia Wartość",
      value: `${analytics.averageOrderValue.toFixed(2)} PLN`,
      icon: TrendingUp,
      description: "na zamówienie",
      color: "text-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Analityczny</h1>
              <p className="text-muted-foreground">Przegląd statystyk i wydajności sklepu</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Orders & Low Stock */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ostatnie Zamówienia</CardTitle>
                <CardDescription>5 najnowszych zamówień</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentOrders.map((order: any) => (
                    <div key={order._id} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order._creationTime).toLocaleDateString("pl-PL")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{order.totalAmount} PLN</p>
                        <p className="text-xs text-muted-foreground">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Niski Stan Magazynowy
                </CardTitle>
                <CardDescription>Produkty wymagające uzupełnienia</CardDescription>
              </CardHeader>
              <CardContent>
                {productStats.lowStockCount === 0 ? (
                  <p className="text-muted-foreground">Wszystkie produkty mają odpowiedni stan</p>
                ) : (
                  <div className="space-y-3">
                    {productStats.lowStockNames.map((name: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between border-b pb-2">
                        <p className="font-medium">{name}</p>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          Niski stan
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Rozkład Statusów Zamówień</CardTitle>
              <CardDescription>Podział zamówień według statusu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{analytics.pendingOrders}</p>
                  <p className="text-sm text-muted-foreground">Oczekujące</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analytics.paidOrders}</p>
                  <p className="text-sm text-muted-foreground">Opłacone</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{analytics.shippedOrders}</p>
                  <p className="text-sm text-muted-foreground">Wysłane</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{analytics.deliveredOrders}</p>
                  <p className="text-sm text-muted-foreground">Dostarczone</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
