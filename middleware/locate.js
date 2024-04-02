// middleware/locate.js

import Location from '../models/Location.js';

const locateMiddleware = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        status: 'failed',
        message: 'Location not found'
      });
    }

    // If the location exists, attach it to the request object so
    // it can be accessed in the subsequent controller without having to query again.
    req.location = location;
    next();
  } catch (error) {
    // If there's an error in searching for the location, such as an invalid ID format:
    res.status(500).json({
      status: 'error',
      message: 'Error checking for location'
    });
  }
};

export default locateMiddleware;
