exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      version: "v20",
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI: !!process.env.GOOGLE_REDIRECT_URI
    })
  };
};
