import SystemSetting from "../models/SystemSetting.js";

// Lấy tất cả settings (admin only)
export const getAllSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.findAll();
    res.json(settings);
  } catch (error) {
    console.error("Lỗi lấy settings:", error);
    res.status(500).json({ message: "Lỗi lấy cài đặt hệ thống." });
  }
};

// Lấy booking timeout (public - cho user biết thời gian giữ chỗ)
export const getBookingTimeout = async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({
      where: { setting_key: "booking_timeout_minutes" },
    });
    
    const timeoutMinutes = setting ? parseInt(setting.setting_value) : 60;
    
    res.json({
      booking_timeout_minutes: timeoutMinutes,
      display: formatTimeDisplay(timeoutMinutes),
    });
  } catch (error) {
    console.error("Lỗi lấy booking timeout:", error);
    res.status(500).json({ message: "Lỗi lấy cài đặt." });
  }
};

// Cập nhật setting (admin only)
export const updateSetting = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (!value && value !== 0) {
    return res.status(400).json({ message: "Giá trị không được để trống." });
  }

  try {
    const [setting, created] = await SystemSetting.findOrCreate({
      where: { setting_key: key },
      defaults: { setting_value: value.toString() },
    });

    if (!created) {
      setting.setting_value = value.toString();
      await setting.save();
    }

    res.json({
      message: `Đã cập nhật ${key} thành ${value}`,
      setting: {
        key: setting.setting_key,
        value: setting.setting_value,
      },
    });
  } catch (error) {
    console.error("Lỗi cập nhật setting:", error);
    res.status(500).json({ message: "Lỗi cập nhật cài đặt." });
  }
};

// Helper: Format thời gian hiển thị
function formatTimeDisplay(minutes) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} giờ`;
    return `${hours} giờ ${mins} phút`;
  }
  return `${minutes} phút`;
}

// Lấy giá trị setting theo key (internal use)
export const getSettingValue = async (key, defaultValue = null) => {
  try {
    const setting = await SystemSetting.findOne({
      where: { setting_key: key },
    });
    return setting ? setting.setting_value : defaultValue;
  } catch (error) {
    console.error(`Lỗi lấy setting ${key}:`, error);
    return defaultValue;
  }
};
