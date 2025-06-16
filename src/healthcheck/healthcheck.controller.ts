import { Controller, Get, All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller()
export class HealthcheckController {
  @Get('*')
  handleGet(@Req() req: Request, @Res() res: Response) {
    // This replicates the functionality from index.ts
    const responseBody = { 
      message: "Hello from Node.js!", 
      path: req.path 
    };
    return res.json(responseBody);
  }

  @All('*')
  handleAll(@Res() res: Response) {
    // This replicates the functionality from index.ts for all other methods
    return res.status(405).send('Method Not Allowed');
  }
}