import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class CacheService {
  public responseCache = new Map();

  constructor(private http: HttpClient) {}

  public setCache(cache_key, cache_data): any {
    this.responseCache.set(cache_key, cache_data);
  }

  public getCache(cache_key) {
    return this.responseCache.get(cache_key);
  }
}
