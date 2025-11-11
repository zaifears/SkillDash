import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

/**
 * ✅ AUTO-UPDATE USER COUNT (v2 syntax)
 * Triggers whenever a new user document is created
 * Updates public_stats/site_stats with current user count
 */
export const updateUserCount = onDocumentCreated(
  "users/{userId}",
  async (event) => {
    try {
      const userId = event.params.userId;
      logger.info(`🔄 New user created: ${userId}, updating count...`);

      // Count all users using aggregation query
      const usersSnapshot = await db.collection("users").count().get();
      const count = usersSnapshot.data().count;

      // Update public stats document
      await db.collection("public_stats").doc("site_stats").set({
        userCount: count,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});

      logger.info(`✅ User count updated: ${count}`);

      return {success: true, count};
    } catch (error) {
      logger.error("❌ Failed to update user count:", error);
      // Don't throw - we don't want to fail user creation
      return {success: false, error};
    }
  }
);

/**
 * ✅ OPTIONAL: Manual trigger to fix count
 * Call via HTTP to recalculate count
 * URL: https://REGION-PROJECT_ID.cloudfunctions.net/manualUpdateUserCount
 */
export const manualUpdateUserCount = onRequest(async (req, res) => {
  try {
    // Count all users
    const usersSnapshot = await db.collection("users").count().get();
    const count = usersSnapshot.data().count;

    // Update stats
    await db.collection("public_stats").doc("site_stats").set({
      userCount: count,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});

    logger.info(`✅ Manual update: ${count} users`);

    res.json({
      success: true,
      userCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("❌ Manual update failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
