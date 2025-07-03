import { useNotifications } from "./NotificationModal";
import NotificationModal from "./NotificationModal";

export default function GlobalNotificationProvider() {
  const { notifications, close } = useNotifications();

  return <NotificationModal notifications={notifications} onClose={close} />;
}
