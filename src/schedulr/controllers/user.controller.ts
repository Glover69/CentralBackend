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
    console.log({ schedules: userData.schedules ?? []})
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



export const deleteSchedule = [requireAuth, async (req: Request, res: Response): Promise<void> => {
  const uid = req.user?.uid; 
  const { scheduleId } = req.query;
  
  // Input validation
  if (!scheduleId || typeof scheduleId !== 'string') {
    res.status(400).json({ error: "Schedule ID is required" });
    return;
  }

  if (!scheduleId.startsWith('sch-')) {
    res.status(400).json({ error: "Invalid schedule ID format" });
    return;
  }

  try {
    // Find user and ensure they own the schedule
    const user = await SchedulrUserModel.findOne({ id: uid });
    
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check if schedule exists and belongs to the user
    const scheduleIndex = user.schedules.findIndex(
      schedule => schedule.schedule_id === scheduleId
    );

    if (scheduleIndex === -1) {
      res.status(404).json({ 
        error: "Schedule not found or you don't have permission to delete it" 
      });
      return;
    }

    // Store schedule info for response (before deletion)
    const deletedSchedule = user.schedules[scheduleIndex];

    // Remove the schedule
    user.schedules.splice(scheduleIndex, 1);
    await user.save();

    // Log for audit trail
    console.log(`🗑️ User ${uid} deleted schedule: ${scheduleId} (${deletedSchedule.semester.schedule_name})`);

    res.status(200).json({
      message: "Schedule deleted successfully",
      deletedSchedule: {
        schedule_id: deletedSchedule.schedule_id,
        schedule_name: deletedSchedule.semester.schedule_name,
        created_at: deletedSchedule.created_at
      }
    });

  } catch (error) {
    console.error("Delete schedule error:", error);
    res.status(500).json({
      message: "Unable to delete schedule at this time",
      error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    });
  }
}];


export const getScheduleById = [requireAuth, async (req: Request, res: Response): Promise<void> => {
  const uid = req.user?.uid;
  const { scheduleId } = req.query;
  
  // Input validation
  if (!scheduleId || typeof scheduleId !== 'string') {
    res.status(400).json({ error: "Schedule ID is required" });
    return;
  }

  if (!scheduleId.startsWith('sch-')) {
    res.status(400).json({ error: "Invalid schedule ID format" });
    return;
  }

  try {
    // Find user
    const user = await SchedulrUserModel.findOne({ id: uid }).lean();
    
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Find the specific schedule
    const schedule = user.schedules?.find(
      schedule => schedule.schedule_id === scheduleId
    );

    if (!schedule) {
      res.status(404).json({ 
        error: "Schedule not found or you don't have permission to access it" 
      });
      return;
    }

    res.status(200).json({
      message: "Schedule retrieved successfully",
      schedule: schedule
    });

  } catch (error) {
    console.error("Get schedule by ID error:", error);
    res.status(500).json({
      message: "Unable to retrieve schedule at this time",
      error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    });
  }
}];


export const updateSchedule = [requireAuth, async (req: Request, res: Response): Promise<void> => {
  const uid = req.user?.uid;
  const { scheduleId } = req.query;
  const { semester, classes }: Partial<Schedule> = req.body;
  
  // Input validation
  if (!scheduleId || typeof scheduleId !== 'string') {
    res.status(400).json({ error: "Schedule ID is required" });
    return;
  }

  if (!scheduleId.startsWith('sch-')) {
    res.status(400).json({ error: "Invalid schedule ID format" });
    return;
  }

  if (!semester && !classes) {
    res.status(400).json({ error: "At least one field (semester or classes) is required for update" });
    return;
  }

  try {
    // Find user (not using .lean() since we need to save)
    const user = await SchedulrUserModel.findOne({ id: uid });
    
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Find the specific schedule index
    const scheduleIndex = user.schedules.findIndex(
      schedule => schedule.schedule_id === scheduleId
    );

    if (scheduleIndex === -1) {
      res.status(404).json({ 
        error: "Schedule not found or you don't have permission to update it" 
      });
      return;
    }

    // Update only the provided fields
    if (semester) {
      user.schedules[scheduleIndex].semester = semester;
    }
    
    if (classes) {
      user.schedules[scheduleIndex].classes = classes;
    }

    // Save the updated user document
    await user.save();

    // Get the updated schedule for response
    const updatedSchedule = user.schedules[scheduleIndex];

    // Log for audit trail
    console.log(`📝 User ${uid} updated schedule: ${scheduleId} (${updatedSchedule.semester.schedule_name})`);

    res.status(200).json({
      message: "Schedule updated successfully",
      schedule: updatedSchedule
    });

  } catch (error) {
    console.error("Update schedule error:", error);
    res.status(500).json({
      message: "Unable to update schedule at this time",
      error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    });
  }
}];


