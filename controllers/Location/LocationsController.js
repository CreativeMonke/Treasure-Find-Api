import Location from "../../models/Location.js";

export async function createLocation(req, res) {
    const { name, picture, question, answer, lat, lng } = req.body;

    try {
        const location = new Location({
            name,
            picture,
            question,
            answer,
            lat,
            lng
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
            code: 500,
            message: "Internal server error",
        });
    }
}

export async function editLocation(req, res) {
    const updates = req.body;
    const {id} = req.params;
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({
        status: 'failed',
        message: 'Location not found'
      });
    }
    
    try {
      // Update the location using the location object attached by the locateMiddleware
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
        message: "Internal Server Error"
      });
    }
  }

export async function deleteLocation(req,res){
    const {id} = req.params;
    try{
        const location = await Location.findByIdAndDelete(id);
        if(!location)
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
    }catch(err){
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
}
export async function getAllLocations(req,res){
    try{
        const locations = await Location.find();
        if(!locations)
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
    }catch(err){
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
}
