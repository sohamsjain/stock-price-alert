'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export const DashboardContent = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Trades',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: 'Active Trades',
      value: '8',
      change: '+3',
      trend: 'up',
      icon: BarChart3,
    },
    {
      title: 'Win Rate',
      value: '72%',
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: 'P&L',
      value: '$2,450',
      change: '-2.1%',
      trend: 'down',
      icon: DollarSign,
    },
  ];

  const recentTrades = [
    {
      id: '1',
      symbol: 'AAPL',
      side: 'Buy',
      entry: 150.25,
      status: 'Active',
      pnl: '+$125.50',
    },
    {
      id: '2',
      symbol: 'GOOGL',
      side: 'Sell',
      entry: 2450.75,
      status: 'Completed',
      pnl: '+$850.25',
    },
    {
      id: '3',
      symbol: 'TSLA',
      side: 'Buy',
      entry: 225.80,
      status: 'Active',
      pnl: '-$45.20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Trader'}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your trading activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>{' '}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Trades and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Trades</CardTitle>
                <CardDescription>
                  Your latest trading activity
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/trades">
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm font-medium">{trade.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        {trade.side} @ ${trade.entry}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={trade.status === 'Active' ? 'default' : 'secondary'}
                    >
                      {trade.status}
                    </Badge>
                    <span className={`text-sm font-medium ${
                      trade.pnl.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trade.pnl}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start" size="lg">
              <Link href="/dashboard/trades/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New Trade
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start" size="lg">
              <Link href="/dashboard/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start" size="lg">
              <Link href="/dashboard/trades?status=active">
                <TrendingUp className="mr-2 h-4 w-4" />
                Active Trades
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>
            Your trading performance at a glance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">72%</div>
              <p className="text-sm text-muted-foreground">Win Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1.8:1</div>
              <p className="text-sm text-muted-foreground">Avg Risk/Reward</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">$2,450</div>
              <p className="text-sm text-muted-foreground">Total P&L</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};