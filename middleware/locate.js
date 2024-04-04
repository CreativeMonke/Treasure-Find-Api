// middleware/locate.js

const locateMiddleware = async (req, res, next) => {
  try {
    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: error,
      message: 'Error checking for location'
    });
  }
};

export default locateMiddleware;
