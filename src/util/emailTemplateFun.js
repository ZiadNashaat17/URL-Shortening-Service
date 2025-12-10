export default (emailSubject, name, url) => {
	return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${emailSubject}</h2>
      <p>Hi ${name},</p>
      <p>Click the button below to verify your email:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 16px;">Verify Email</a>
      </div>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${url}</p>
      <p style="color: #999; font-size: 12px;">This link will expire in 10 minutes.</p>
      <p>Best regards,<br>URL Shortening Team</p>
    </div>
  `;
};
