// Dummy email sender for password reset
module.exports = async function sendEmail(to, subject, text) {
  // In production, use nodemailer or similar
  console.log(`\n--- EMAIL SENT ---\nTo: ${to}\nSubject: ${subject}\n${text}\n-----------------\n`);
};
