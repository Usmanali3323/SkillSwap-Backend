import { Report } from "../../Models/report.model.js";
import { Skill } from "../../Models/Skill.model.js";
import User from "../../Models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";



// POST /report/send-report
export const sendReportController = async (req, res) => {
  try {
    const skillId = req.params.skillId
    const { userId, reason, description } = req.body;

    if (!skillId || !userId || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Optional: Prevent duplicate reports from the same user
    const existingReport = await Report.findOne({ skillId, userId });
    if (existingReport) {
        const updateReport = await Report.findByIdAndUpdate(existingReport._id,{reason,description});
      return res.status(200).json(new ApiResponse(200,updateReport,"Report successfully submit"));
    }

    const newReport = new Report({
      skillId,
      userId,
      reason,
      description,
    });

   const report = await newReport.save();

await Skill.findByIdAndUpdate(
  skillId,
  { $push: { reports: report._id } },
  { new: true }
);


    res.status(201).json({
      message: 'Report submitted successfully',
      data: newReport,
    });
  } catch (err) {
    console.error('Error in sendReport:', err);
    res.status(500).json({ message: 'Failed to submit report' });
  }
};

// GET /report/all
export const getAllReportsController = async (req, res) => {
  try {
    const reports = await Report.find({isRead:false})
      .populate('skillId')
      .populate('userId', 'fullName email profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Reports fetched successfully',
      data: reports,
    });
  } catch (err) {
    console.error('Error in getAllReports:', err);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

// DELETE /report/:id
export const deleteReportController = async (req, res) => {
  try {
    const reportId = req.params.id;

    const deleted = await Report.findByIdAndDelete(reportId);

    if (!deleted) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({
      message: 'Report deleted successfully',
      data: deleted,
    });
  } catch (err) {
    console.error('Error in deleteReport:', err);
    res.status(500).json({ message: 'Failed to delete report' });
  }
};


export const readReportByAdminController = async (req, res) => {
  try {
    const {reportId} = req.body;
    console.log("working inside !!")

    // const { reportId } = req.body;
    console.log("Report ID:", reportId);

    if (!reportId) {
      return res.status(400).json(
        new ApiError(400, {}, "reportId is required")
      );
    }

    const updateReport = await Report.findByIdAndUpdate(
      reportId,
      { isRead: true },
      { new: true }
    );

    if (!updateReport) {
      return res.status(404).json(
        new ApiError(404, {}, "Report not found")
      );
    }

    return res.status(200).json(
      new ApiResponse(200, updateReport, "Report read successfully")
    );

  } catch (error) {
    console.error("Error in readReportController:", error);

    return res.status(error.statusCode || 500).json(
      new ApiError(
        error.statusCode || 500,
        error.error || {},
        error.message || "Internal Server Error"
      )
    );
  }
};
