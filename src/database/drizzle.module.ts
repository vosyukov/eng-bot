import { Module, OnModuleDestroy, Injectable, Global } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

@Global()
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private pool: Pool;
  public orm: ReturnType<typeof drizzle>;

  constructor(configService: ConfigService) {
    this.pool = new Pool({
      connectionString: configService.get<string>("DATABASE_URL"),
    });
    this.orm = drizzle(this.pool);
  }

  async onModuleDestroy() {
    if (this.pool.ended) {
      console.log("Database connections already closed, skipping...");
      return;
    }

    console.log("Closing database connections...");
    await this.pool.end();

    console.log("Database connections closed");
  }
}

@Module({
  imports: [ConfigModule],
  providers: [
    DatabaseService,
    {
      provide: "DRIZZLE_ORM",
      useFactory: (databaseService: DatabaseService) => databaseService.orm,
      inject: [DatabaseService],
    },
  ],
  exports: ["DRIZZLE_ORM", DatabaseService],
})
export class DrizzleModule {}
