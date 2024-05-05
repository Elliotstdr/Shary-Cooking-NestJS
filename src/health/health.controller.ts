import { Controller, Get, Req } from '@nestjs/common';
import { Request, Router } from 'express';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return 'Success';
  }

  @Get('routes')
  routes(@Req() req: Request) {
    const router = req.app._router as Router;
    return router.stack
      .map((layer) => {
        if (layer.route) {
          const path = layer.route?.path;
          const method = layer.route?.stack[0].method;
          return `${method.toUpperCase()} ${' '.repeat(7 - method.length)} ${path}`;
        }
      })
      .filter((item) => item !== undefined);
  }
}
