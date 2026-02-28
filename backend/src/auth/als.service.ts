//Local: /src/auth/als.service.ts

import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class AlsService {
  // Tipamos o Map para aceitar chaves string e valores string
  private readonly als = new AsyncLocalStorage<Map<string, string>>();

  run(store: Map<string, string>, callback: () => void) {
    this.als.run(store, callback);
  }

  // Definimos que o retorno é string ou undefined, evitando o 'any'
  get(key: string): string | undefined {
    const store = this.als.getStore();
    return store?.get(key);
  }
}
