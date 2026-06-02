import { google } from "googleapis";
import axios from "axios";
import { ensureGoogleCredentialsFile } from "../utils/googleServiceAccount";
import UserDeviceModel from "../models/UserDeviceModel";

ensureGoogleCredentialsFile();

const FCM_ENDPOINT =
  "https://fcm.googleapis.com/v1/projects/mediact-f3530/messages:send";
const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

// อ่าน service account credentials
export const getAccessToken = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: SCOPES,
  });
  const accessToken = await auth.getAccessToken();
  return accessToken;
};

// Payload type: allow optional title/body for silent messages and optional apns/android
type PushNotiPayload = {
  title?: string;
  body?: string;
  data?: Record<string, any>;
  apns?: any;
  android?: any;
} & ({ token: string; topic?: never } | { token?: never; topic: string });

export const sendPushNotification = async (payload: PushNotiPayload) => {
  console.log("💥💥💥 PUSH NOTIFICATION SERVICE CALLED! 💥💥💥");
  console.log("Call stack:", new Error().stack);
  console.log("Payload:", payload);

  const accessToken = await getAccessToken();

  console.log("============= Sending push notification with payload:", payload);

  const messageBody: any = {
    message: {
      ...(payload.title || payload.body
        ? { notification: { title: payload.title || "", body: payload.body || "" } }
        : {}),
      data: Object.fromEntries(
        Object.entries(payload.data || {}).map(([k, v]) => [k, String(v)])
      ),
      ...(payload.token && { token: payload.token }),
      ...(payload.topic && { topic: payload.topic }),
    },
  };

  // Attach platform overrides when provided (apns/android)
  if (payload.apns) {
    messageBody.message.apns = payload.apns;
  }
  if (payload.android) {
    messageBody.message.android = payload.android;
  }

  if (!payload.token && !payload.topic) {
    console.error("No token or topic provided for push notification");
    return;
  }

  console.log("============= Sending push notification with message:", JSON.stringify(messageBody, null, 2));

  try {
    const response = await axios.post(FCM_ENDPOINT, messageBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("FCM response:", response.data);
    return response.data;
  } catch (error) {
    const errorData = (error as any)?.response?.data;
    console.error("FCM error:", errorData || error);

    if (payload.token && errorData?.error?.details?.[0]?.errorCode === "UNREGISTERED") {
      console.log(`Token ${payload.token} is unregistered, deactivating device...`);
      try {
        await UserDeviceModel.update(
          { is_active: false },
          { where: { push_token: payload.token } }
        );
        console.log(`Successfully deactivated device with token: ${payload.token}`);
      } catch (updateError) {
        console.error("Failed to deactivate device:", updateError);
      }
      return { success: false, reason: "UNREGISTERED_TOKEN_DEACTIVATED" };
    }

    throw new Error(
      "Failed to send push notification: " +
      JSON.stringify(errorData || (error as Error).message)
    );
  }
};
