//Local: /src/auth/audit.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { AlsService } from './als.service';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(private readonly alsService: AlsService) {}

  use(req: any, res: any, next: () => void) {
    const store = new Map<string, string>();
    // Garantimos que o username seja sempre uma string
    const username = String(req.user?.email || req.user?.username || 'SISTEMA');

    store.set('username', username);
    this.alsService.run(store, next);
  }
}
