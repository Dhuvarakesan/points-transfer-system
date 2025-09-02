import { Request, Response, Router } from "express";
import { authenticateUser, refreshAccessToken } from "../controllers/authentication.controller";

const publicRoutes = Router();
const port = process.env.PORT || 3000;
publicRoutes.use("/authenticate", authenticateUser);
publicRoutes.post("/refresh-token", refreshAccessToken);
publicRoutes.get("/", (req: Request, res: Response) => {

    res.send(`
      
        <div style="display: flex; justify-content: center; align-items: center; height:100%; text-align: center; font-family: Arial, sans-serif; background-color: #f8f9fa;">
          <pre style="font-size: 18px; font-weight: bold; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    🎉 Welcome to the Inventory Management Server! 🎉
    --------------------------------------------
    🚀 The server is up and running smoothly!
    🌐 Current Status: ONLINE
    🟢 Port: ${port}
    --------------------------------------------
    Thank you for using our service! 😊
    
          </pre>
        </div>
       
      `);
}
)

export default publicRoutes;