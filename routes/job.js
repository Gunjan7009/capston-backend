const express = require("express");
const router = express.Router();
const Job = require("../schemas/job.schema");
const User = require("../schemas/user.schema");
const { isLoggedIn } = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const env = require("dotenv");
env.config();

router.post("/", isLoggedIn, async (req, res) => {
  try {
    const {
      companyName,
      logoURL,
      position,
      salary,
      jobType,
      remote,
      location,
      description,
      about,
      skillsRequired,
      information,
    } = req.body;
    console.log(req.body)
    const user = await User.findOne({ email: req.user.email });
    console.log(user)
    const newJob = await new Job({
      companyName,
      logoURL,
      position,
      salary,
      jobType,
      remote,
      location,
      description,
      about,
      skillsRequired,
      information,
      userId: user._id,
    }).save();
    console.log(newJob)
    return res
      .status(200)
      .json({ message: "Job created successfully", id: newJob._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", isLoggedIn, async (req, res) => {
  try {
    const { title, description, salary, location } = req.body;
    const user = await User.findOne({ email: req.user.email });
    const job = await Job.findOne({ _id: req.params.id, userId: user._id });
    if (!job) {
      res.status(400).json({ message: "Job not found" });
      return;
    }
    job.title = title;
    job.description = description;
    job.salary = salary;
    job.location = location;
    await job.save();
    return res.status(200).json({ message: "Job updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const job = await Job.findOne({ _id: req.params.id, userId: user._id });
    if (!job) {
      res.status(400).json({ message: "Job not found" });
      return;
    }
    await Job.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }
    return res.status(200).json(job);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  // query params
  let jobs = [];
  const query = req.query.search || "";
  const offset = req.query.offset || 0;
  const limit = req.query.limit || 2;
  jobs = await Job.find({ title: { $regex: query, $options: "i" } })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);
  return res.status(200).json(jobs);
});

module.exports = router;
