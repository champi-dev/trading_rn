function round2(num) {
  return Math.round(num * 100) / 100;
}

function errorResponse(res, statusCode, message, code) {
  return res.status(statusCode).json({ error: true, message, code });
}

module.exports = { round2, errorResponse };
