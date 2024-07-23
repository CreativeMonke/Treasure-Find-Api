import Answer from "../../models/Response.js";
import Location from "../../models/Location.js";
import User from "../../models/User.js";
import { json2csv } from "json-2-csv";
import Hunt from "../../models/Hunt.js";

export async function csvAllData(req, res) {
  try {
    const answers = await Answer.find();
    const userIds = [...new Set(answers.map((answer) => answer.userId))];
    const locationIds = [
      ...new Set(answers.map((answer) => answer.locationId)),
    ];

    const users = await User.find({ _id: { $in: userIds } });
    const locations = await Location.find({ _id: { $in: locationIds } });

    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {});
    const locationMap = locations.reduce((map, location) => {
      map[location._id.toString()] = location;
      return map;
    }, {});

    let csvData = answers
      .map((answer) => {
        const userData = userMap[answer.userId.toString()];
        const locationData = locationMap[answer.locationId.toString()];

        if (!userData || !locationData) {
          console.log(
            `Missing data for answer ID ${answer._id}: User ID ${answer.userId}, Location ID ${answer.locationId}`
          );
          return null;
        }
        return {
          firstName: userData.first_name,
          lastName: userData.last_name,
          town: userData.town,
          locationName: locationData.name,
          question: answer.question,
          correctAnswer: answer.correctAnswer.split(";")[0],
          answer: answer.answer != " " ? answer.answer : "undefined",
          aiEvaluationScore: answer.evaluationScore,
        };
      })
      .filter((row) => row !== null);

    const csvOptions = {
      keys: [
        { field: "firstName", title: "Prenume" },
        { field: "lastName", title: "Nume" },
        { field: "town", title: "Oraș" },
        { field: "locationName", title: "Nume locație" },
        { field: "question", title: "Întrebare" },
        { field: "correctAnswer", title: "Răspuns corect" },
        { field: "answer", title: "Răspuns" },
        { field: "aiEvaluationScore", title: "Scor evaluare IA" },
      ],
      delimiter: {
        wrap: '"', // Wrap values in double quotes
        field: "|", // Field delimiter
        array: ";", // Use semicolon for array values
        eol: "\n", // End of line value
      },
      escape: true,
    };
    // Convert JSON to CSV using json-2-csv
    const csv = json2csv(csvData, csvOptions);
    // Send CSV data as a file download
    res.status(200).send(csv);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      data: err,
    });
  }
}

export async function CsvAllDataByHuntId(req, res) {
  const { huntId } = req.params;
  try {
    const hunt = await Hunt.findById(huntId)
      .populate({
        path: "location_ids",
        model: Location,
      })
      .populate({
        path: "participating_user_ids",
        model: User,
      })
      .exec();

    if (!hunt) {
      return res
        .status(404)
        .json({ status: "error", message: "Hunt not found" });
    }
    console.log("hunt", hunt);
    const answers = await Answer.find({ huntId })
      .populate({
        path: "userId",
        model: User,
        select: "first_name last_name town",
      })
      .populate({
        path: "locationId",
        model: Location,
        select: "name",
      })
      .exec();
    console.log("answers", answers);
    let csvData = answers
      .map((answer) => {
        const userData = answer.userId;
        const locationData = answer.locationId;
        if (!userData || !locationData) {
          console.log(
            `Missing data for answer ID ${answer._id}: User ID ${answer.userId}, Location ID ${answer.locationId}`
          );
          return null;
        }
        return {
          firstName: userData.first_name,
          lastName: userData.last_name,
          town: userData.town,
          locationName: locationData.name,
          question: answer.question,
          correctAnswer: answer.correctAnswer.split(";")[0],
          answer: answer.answer.trim() !== "" ? answer.answer : "undefined",
          aiEvaluationScore: answer.evaluationScore,
        };
      })
      .filter((row) => row !== null);

    console.log("csvData", csvData);

    const csvFields = {
      keys: [
        { field: "firstName", title: "Prenume" },
        { field: "lastName", title: "Nume" },
        { field: "town", title: "Oraș" },
        { field: "locationName", title: "Nume locație" },
        { field: "question", title: "Întrebare" },
        { field: "correctAnswer", title: "Răspuns corect" },
        { field: "answer", title: "Răspuns" },
        { field: "aiEvaluationScore", title: "Scor evaluare IA" },
      ],
      delimiter: {
        wrap: '"', // Wrap values in double quotes
        field: "|", // Field delimiter
        array: ";", // Use semicolon for array values
        eol: "\n", // End of line value
      },
      escape: true,
    };

    const csv = json2csv(csvData, csvFields);

    res.status(200).json({
      status: "success",
      message: "CSV data generated successfully",
      data: csv,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      data: err,
    });
  }
}
