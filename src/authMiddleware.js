async (req, res, next) => {
  try {
    const FILEPATH = path.join(__dirname, "./keys/public.key");
    const publicKey = fs.readFileSync(FILEPATH, "utf-8");
    if (req.headers.authorization) {
      jsonwebtoken.verify(
        req.headers.authorization,
        publicKey,
        (err, decoded) => {
          if (err) {
            res.status(403).json({
              message: "Invalid Token",
              data: null,
            });
          } else {
            next();
          }
        },
      );
    } else {
      res.status(403).json({
        message: "Token not supplied",
        data: null,
      });
    }
  } catch (err) {
    console.error("[Error: Queue/Add]", err);
    res.status(500).json({
      message: "Internale Server Error",
      data: null,
    });
  }
};
