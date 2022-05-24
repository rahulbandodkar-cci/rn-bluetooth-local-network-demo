import { Platform } from 'react-native';
import RNPermissions, { PERMISSIONS, RESULTS, Permission, PermissionStatus } from 'react-native-permissions';

export interface PermissionCheckHandler {
  /**
   * Callback on permission denied/blocked
   */
  onDenied?: () => void;
  /**
   * Callback on permission denied previously, but requestable
   */
  onPreviouslyDenied?: () => void;
  /**
   * Callback on permission granted
   */
  onGranted?: () => void;
}

export const Permissions = {
  LOCATION: Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  }) as string,
  CAMERA: Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  }) as string,
  PHOTO: Platform.select({
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  }) as string,
  MICROPHONE: Platform.select({
    ios: PERMISSIONS.IOS.MICROPHONE,
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
  }) as string,
  BLUETOOTH: Platform.select({
    ios: PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
    android: PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  }) as string,
};

/**
 * Class to manage the native permissions - i.e. camera, location, etc
 */
export class PermissionsManager {
  /**
   * check
   * @param permission the permission you are requesting
   * @param checkHandler the callback handler for permission status
   * @description Check permission to determine if it has been granted, or we're allowed to request it
   */
  public static check(permission: string, checkHandler: PermissionCheckHandler = {}): void {
    RNPermissions.check(permission as Permission)
      .then((result: PermissionStatus) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            checkHandler.onDenied?.();
            break;
          case RESULTS.DENIED:
            checkHandler.onPreviouslyDenied?.();
            break;
          case RESULTS.LIMITED:
            checkHandler.onGranted?.();
            break;
          case RESULTS.GRANTED:
            checkHandler.onGranted?.();
            break;
          case RESULTS.BLOCKED:
            checkHandler.onDenied?.();
            break;
          default:
            break;
        }
      })
      .catch((err) => {
        checkHandler?.onDenied?.();
      });
  }

  /**
   * request
   * @param permission the permission you are requesting
   * @returns Promise<PermissionStatus>
   */
  public static request(permission: string): Promise<PermissionStatus> {
    return RNPermissions.request(permission as Permission);
  }

  /**
   * determineStatus
   * @param status the permission status received from `request`
   * @returns Promise<boolean> Whether or not the permission was granted
   */
  public static determineStatus(status: PermissionStatus): Promise<boolean> {
    switch (status) {
      case RESULTS.UNAVAILABLE:
        return Promise.resolve(false);
      case RESULTS.DENIED:
        return Promise.resolve(false);
      case RESULTS.LIMITED:
        return Promise.resolve(true); // Granted
      case RESULTS.GRANTED:
        return Promise.resolve(true); // Granted
      case RESULTS.BLOCKED:
        return Promise.resolve(false);
      default:
        return Promise.resolve(false);
    }
  }
}

export default PermissionsManager;
