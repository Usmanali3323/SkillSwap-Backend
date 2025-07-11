import {Notification} from "../../Models/notification.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";


/**
 * GET /notifications
 * Returns all notifications for the logged-in user, newest first.
 */
export const getNotificationsController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, notifications, "Notifications fetched successfully"));
  } catch (err) {
    console.error("Error in getNotifications:", err);
    next(err);
  }
};

/**
 * PATCH /notifications/:id/read
 * Marks a single notification as read.
 */
export const markNotificationReadController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!updated) {
      return res
        .status(404)
        .json(new ApiError(404, {}, "Notification not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Notification marked as read"));
  } catch (err) {
    console.error("Error in markNotificationRead:", err);
    next(err);
  }
};

/**
 * PATCH /notifications/read-all
 * Marks all notifications for the user as read.
 */
export const markAllReadController = async (req, res, next) => {
  try {
    const { acknowledged, modifiedCount } = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );
    return res
      .status(200)
      .json(new ApiResponse(
        200,
        { acknowledged, modifiedCount },
        "All notifications marked as read"
      ));
  } catch (err) {
    console.error("Error in markAllRead:", err);
    next(err);
  }
};

/**
 * DELETE /notifications/:id
 * Deletes a single notification.
 */
export const deleteNotificationController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = await Notification.findOneAndDelete({
      _id: id,
      user: req.user._id
    });
    if (!removed) {
      return res
        .status(404)
        .json(new ApiError(404, {}, "Notification not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Notification deleted"));
  } catch (err) {
    console.error("Error in deleteNotification:", err);
    next(err);
  }
};
export const createNotificationcontroller = async(req,res)=>{
    try {
        const {message,type,userId}=req.body;
       const createdNotification =  await Notification.create({
            user:userId,
            type,
            message
    })
    res.status(200).json(new ApiResponse(200,createdNotification,"Succsfully Send notification"))
    } catch (error) {
        res.status(500).json(
            new ApiError(error.statCode,error.error,error.message)
        )
    }
}