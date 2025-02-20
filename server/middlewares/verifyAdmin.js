const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;

  console.log({ admin_email: email });
  const adminEmail = 'admin-efurnish@gmail.com';
  if (email !== adminEmail) {
    return res.status(403).send({ error: true, message: 'forbidden access' });
  }
  next();
};

module.exports = verifyAdmin;
