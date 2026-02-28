import Donation from "../models/Donation.js";
import { AppError } from "../utils/AppError.js";

export async function getMyDonations(req, res, next) {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ donations });
  } catch (err) {
    next(err);
  }
}

export async function getDonationById(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id).lean();
    if (!donation) {
      throw new AppError("Donation not found", 404);
    }
    if (donation.donor.toString() !== req.user._id.toString()) {
      throw new AppError("You can only view your own donations", 403);
    }
    res.json(donation);
  } catch (err) {
    next(err);
  }
}

export async function createDonation(req, res, next) {
  try {
    const { title, description, category, images } = req.body;
    if (!title || !title.trim()) {
      throw new AppError("Title is required", 400);
    }
    const donation = await Donation.create({
      donor: req.user._id,
      title: title.trim(),
      description: description?.trim() ?? "",
      category: category?.trim() ?? "",
      images: Array.isArray(images) ? images.filter(Boolean).slice(0, 10) : [],
      status: "pending",
    });
    res.status(201).json(donation);
  } catch (err) {
    next(err);
  }
}
