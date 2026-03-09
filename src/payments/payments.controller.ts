import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

// For MVP we simulate Toss integration. In production integrate with Toss API and verify webhooks.
@Controller('api/v1/payments/toss')
export class PaymentsController {
  @UseGuards(AuthGuard)
  @Post('create')
  async create(@Req() req: any, @Body() body: { order_id: string; amount: number; return_url: string }) {
    // Simulate a payment_session_id and checkout_url
    const payment_session_id = 'sess_' + Math.random().toString(36).substring(2, 12);
    const checkout_url = `${body.return_url}?session_id=${payment_session_id}`;
    // Normally you'd save a payment record and return the external checkout URL
    return { payment_session_id, checkout_url };
  }

  // Callback from Toss (public endpoint)
  @Post('callback')
  async callback(@Body() body: any) {
    // In real implementation: verify signature and update order status
    // Here we accept the callback and return ok
    return { result: 'ok' };
  }
}
