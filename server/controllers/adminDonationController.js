import Donation from "../models/Donation.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";

export async function getDonationById(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donor", "firstName lastName email")
      .lean();
    if (!donation) {
      throw new AppError("Donation not found", 404);
    }
    res.json(donation);
  } catch (err) {
    next(err);
  }
}

export async function getAllDonations(req, res, next) {
  try {
    const { donor } = req.query;
    const filter = donor ? { donor } : {};
    const donations = await Donation.find(filter)
      .populate("donor", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean();
    const donorIds = await Donation.distinct("donor");
    const donors =
      donorIds.length > 0
        ? await User.find({ _id: { $in: donorIds } })
            .select("_id firstName lastName email")
            .sort("firstName")
            .lean()
        : [];
    res.json({ donations, donors });
  } catch (err) {
    next(err);
  }
}

export async function getDonors(req, res, next) {
  try {
    const donorIds = await Donation.distinct("donor");
    const donors =
      donorIds.length > 0
        ? await User.find({ _id: { $in: donorIds } })
            .select("_id firstName lastName email")
            .sort("firstName")
            .lean()
        : [];
    res.json({ donors });
  } catch (err) {
    next(err);
  }
}
