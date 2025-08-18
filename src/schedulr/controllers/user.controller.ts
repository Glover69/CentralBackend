import { Request, Response } from "express";
import { Schedule, SchedulrUserModel } from "../models/user.models";
import { requireAuth } from "../middlewares/auth.middleware";
import { v4 as uuidv4 } from "uuid";

export const getUserSchedules = [requireAuth, async (
  req: Request,
  res: Response
): Promise<void> => {
  const uid = req.user?.uid; // set by requireAuth from the cookie session
  if (!uid) { 
    res.status(401).json({ error: 'Unauthorized' });
    return 
  };

  try {
    const userData = await SchedulrUserModel.findOne({ id: uid }).lean();

    if (!userData) {
      res.status(400).send(`Failed to find any data for the user with id ${uid}.`);
      return;
    }

    res.status(200).send({schedules: userData.schedules ?? [] });
  } catch (error) {
    console.error("Get user data error:", error);
    res
      .status(500)
      .json({
        message: "Unable to process getting user data at this time",
        error: error,
      });
  }
}];


export const createSchedule = [requireAuth, async (req: Request, res: Response): Promise<void> => {
    const { id } = req.query
    const { semester, classes}: Partial<Schedule> = req.body

    if( !semester || !classes ){
        res.status(400).send("Missing required fields from payload")
        return
    }

    if(!id){
        res.status(400).send("Missing required user id")
    }

    try {
        const user = await SchedulrUserModel.findOne({ id: id })

        if (!user) {
            res.status(404).send(`Failed to find user with id: ${id}.`);
            return;
        } 
        
        const schedule: Schedule = {
          semester,
          classes,
          schedule_id: `sch-${uuidv4()}`,
          created_at: new Date()
        }

        user.schedules.push(schedule);
        await user.save();

        res.status(201).json({
            message: "Schedule created successfully",
            schedule: schedule
        });

    } catch (error) {
        console.error("Create schedule error:", error);
        res.status(500).json({
         message: "Unable to process creating schedule at this time",
         error: error,
        });
    }
}]


