import express, { Request, Response } from "express";
import { UnitUser, User } from "./user.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./user.database";

export const userRouter = express.Router();

userRouter.get("/users", async (req: Request, res: Response) => {
  try {
    const allUsers: UnitUser[] = await database.findAll();
    if (!allUsers || allUsers.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No users at this time" });
    }
    return res
      .status(StatusCodes.OK)
      .json({ totalUsers: allUsers.length, allUsers });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: (error as Error).message });
  }
});

userRouter.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const user: UnitUser | null = await database.findOne(req.params.id);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }
    return res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: (error as Error).message });
  }
});

userRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "All fields are required" });
    }
    const user = await database.findByEmail(email);
    if (user) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ error: "This email has already been registered" });
    }
    const newUser = await database.create({ username, email, password });
    return res.status(StatusCodes.CREATED).json({ newUser });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: (error as Error).message });
  }
});

userRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Please provide all required parameters" });
    }
    const user = await database.comparePassword(email, password);
    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Invalid email or password" });
    }
    return res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: (error as Error).message });
  }
});

userRouter.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Please provide all required parameters" });
    }
    const updatedUser = await database.update(req.params.id, {
      username,
      email,
      password,
    });
    if (!updatedUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `No user with id ${req.params.id}` });
    }
    return res.status(StatusCodes.OK).json({ updatedUser });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: (error as Error).message });
  }
});

userRouter.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const result = await database.remove(req.params.id);
    if (!result) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "User does not exist" });
    }
    return res
      .status(StatusCodes.OK)
      .json({ message: "User deleted successfully" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: (error as Error).message });
  }
});
