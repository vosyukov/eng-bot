import { Controller, Get, All, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";

@Controller()
export class HealthcheckController {
  @Get("*")
  handleGet(@Req() req: Request, @Res() res: Response) {
    const responseBody = {
      message: "Hello from Node.js!",
      path: req.path,
    };
    return res.json(responseBody);
  }

  @All("*")
  handleAll(@Res() res: Response) {
    return res.status(405).send("Method Not Allowed");
  }
}
