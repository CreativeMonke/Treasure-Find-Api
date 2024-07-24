import Location from "../../models/Location.js";

export async function createLocation(req, res) {
  const { name, imgSrc, question, answer, lat, lng } = req.body;
  const { _id: userId } = req.user;

  try {
    const location = new Location({
      name,
      imgSrc,
      question,
      answer,
      lat,
      lng,
      author_id: userId,
    });
    await location.save();
    res.status(201).json({
      status: "success",
      data: location,
      message: "Location created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      data: [err],
      message: "Internal server error",
    });
  }
}

export async function editLocation(req, res) {
  const updates = req.body;
  const { id } = req.params;
  const location = await Location.findById(id);
  if (!location) {
    return res.status(404).json({
      status: "failed",
      message: "Location not found",
    });
  }

  try {
    Object.assign(location, updates);

    await location.save();

    res.status(200).json({
      status: "success",
      data: location,
      message: "Location updated successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      data: [err],
      message: "Internal Server Error",
    });
  }
}

export async function deleteLocation(req, res) {
  const { id } = req.params;
  try {
    const location = await Location.findByIdAndDelete(id);
    if (!location)
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Location not found",
      });
    res.status(200).json({
      status: "success",
      data: location,
      message: "Location deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      data: [err],
      message: "Internal server error",
    });
  }
}
export async function getAllLocations(req, res) {
  try {
    const locations = await Location.find();
    if (!locations)
      return res.status(404).json({
        status: "error",
        message: "Locations not found",
      });
    res.status(200).json({
      status: "success",
      data: locations,
      message: "Locations fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      data: [err],
      message: "Internal server error",
    });
  }
}

export async function getAllLocationsByUserHuntId(req, res) {
  try {
    const huntId = req.user.currentHuntId;
    const locations = await Location.find({ hunts: huntId });
    if (!locations)
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Locations not found",
      });
    res.status(200).json({
      status: "success",
      data: locations,
      message: "Locations fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      data: [err],
      message: "Internal server error",
    });
  }
}

export async function getAllLocationsByHuntId(req, res) {
  const { huntId } = req.params;
  try {
    const locations = await Location.find({ hunts: huntId });
    //console.log("Locations - byHuntId", locations);
    if (!locations)
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Locations not found",
      });
    res.status(200).json({
      status: "success",
      data: locations,
      message: "Locations fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      data: [err],
      message: "Internal server error",
    });
  }
}

export async function getAllLocationsByAuthorId(req, res) {
  const { _id: userId } = req.user;
  ///fetch all locations based on the author_id
  try {
    const locations = await Location.find({ author_id: userId });
    if (!locations)
      return res.status(404).json({
        status: "error",
        message: "Locations not found",
      });
    res.status(200).json({
      status: "success",
      data: locations,
      message: "Locations fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      data: [err],
      message: "Internal server error",
    });
  }
}
