import { Inject } from "@nestjs/common";
import { LoggingService } from "./logging.service";

/**
 * A simple decorator that injects the LoggingService.
 * You still need to manually set the context in the constructor.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class MyService {
 *   constructor(
 *     @InjectLogger() private readonly logger: LoggingService
 *   ) {
 *     this.logger.setContext('MyService');
 *   }
 * }
 * ```
 */
export const InjectLogger = () => Inject(LoggingService);
