'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Unlink, CheckCircle, XCircle } from 'lucide-react';
import { telegramApi, TelegramStatusResponse, TelegramVerificationResponse } from '@/lib/api/telegram';

export function TelegramSettings() {
  const [verificationDialogOpen, setVerificationDialogOpen] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState<string | null>(null);
  const [botUsername, setBotUsername] = React.useState<string>('');
  const [status, setStatus] = React.useState<TelegramStatusResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);

  // Fetch Telegram status on mount
  React.useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const data = await telegramApi.getStatus();
      setStatus(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsGenerating(true);
      const data: TelegramVerificationResponse = await telegramApi.generateCode();
      setVerificationCode(data.verification_code);
      setBotUsername(data.bot_username);
      setVerificationDialogOpen(true);
      toast.success('Verification code generated!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Telegram?')) {
      return;
    }

    try {
      setIsDisconnecting(true);
      await telegramApi.disconnect();
      await fetchStatus(); // Refresh status
      toast.success('Telegram disconnected successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to disconnect');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const openTelegramBot = () => {
    if (verificationCode) {
      window.open(
        `https://t.me/${botUsername}?start=${verificationCode}`,
        '_blank'
      );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Telegram Notifications</CardTitle>
              <CardDescription>
                Get instant alerts when your trade levels are hit
              </CardDescription>
            </div>
            {status?.connected ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <XCircle className="h-3 w-3" />
                Not Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.connected ? (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Telegram Username</span>
                    <span className="font-medium">@{status.username}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Connected At</span>
                    <span className="font-medium">
                      {status.connected_at
                        ? new Date(status.connected_at).toLocaleString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="w-full"
              >
                {isDisconnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Unlink className="mr-2 h-4 w-4" />
                    Disconnect Telegram
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed p-6 text-center">
                <Send className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  Connect Your Telegram Account
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Receive instant notifications when your price alerts trigger
                </p>
              </div>
              <Button
                onClick={handleConnect}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Code...
                  </>
                ) : (
                  'Connect Telegram'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Telegram Account</DialogTitle>
            <DialogDescription>
              Follow these steps to connect your Telegram account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  1
                </div>
                <p className="text-sm">Copy your verification code below</p>
              </div>
              <div className="rounded-lg border bg-muted p-4 text-center">
                <code className="text-2xl font-mono font-bold tracking-wider">
                  {verificationCode}
                </code>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                2
              </div>
              <p className="text-sm">
                Open our Telegram bot and send the command:
              </p>
            </div>

            <div className="rounded-lg border bg-muted p-3 text-center font-mono text-sm">
              /start {verificationCode}
            </div>

            <Button onClick={openTelegramBot} className="w-full" size="lg">
              <Send className="mr-2 h-4 w-4" />
              Open Telegram Bot
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Code expires in 15 minutes
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}