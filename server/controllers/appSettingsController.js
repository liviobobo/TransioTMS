// Obține setările aplicației (momentan doar informații de bază)
const getAppSettings = async (req, res) => {
  try {
    const settings = {
      appName: 'Transio',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      features: {
        rapoarte: true,
        export: true,
        multiUser: true,
        notifications: false // Pentru viitor
      }
    };

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Eroare la obținerea setărilor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea setărilor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAppSettings
};