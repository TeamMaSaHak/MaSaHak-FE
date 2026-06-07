package expo.modules.appmonitor

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.ByteArrayOutputStream

class AppMonitorModule : Module() {
    private val context: Context get() = appContext.reactContext!!

    override fun definition() = ModuleDefinition {
        Name("AppMonitor")

        AsyncFunction("getInstalledApps") {
            val pm = context.packageManager
            val myPackage = context.packageName
            val apps = pm.getInstalledApplications(PackageManager.GET_META_DATA)

            apps
                .filter { (it.flags and ApplicationInfo.FLAG_SYSTEM) == 0 }
                .filter { it.packageName != myPackage }
                .map { appInfo ->
                    val icon = try {
                        val drawable = pm.getApplicationIcon(appInfo.packageName)
                        val size = 48
                        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
                        val canvas = Canvas(bitmap)
                        drawable.setBounds(0, 0, size, size)
                        drawable.draw(canvas)
                        val stream = ByteArrayOutputStream()
                        bitmap.compress(Bitmap.CompressFormat.PNG, 70, stream)
                        "data:image/png;base64," + Base64.encodeToString(
                            stream.toByteArray(), Base64.NO_WRAP
                        )
                    } catch (e: Exception) {
                        null
                    }
                    mapOf(
                        "packageName" to appInfo.packageName,
                        "name" to pm.getApplicationLabel(appInfo).toString(),
                        "icon" to icon
                    )
                }
                .sortedBy { (it["name"] as? String)?.lowercase() ?: "" }
        }

        AsyncFunction("checkUsageStatsPermission") {
            val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    android.os.Process.myUid(),
                    context.packageName
                )
            } else {
                @Suppress("DEPRECATION")
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    android.os.Process.myUid(),
                    context.packageName
                )
            }
            mode == AppOpsManager.MODE_ALLOWED
        }

        AsyncFunction("requestUsageStatsPermission") {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
                // 직접 앱 항목으로 이동 (Android 10+)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    data = Uri.fromParts("package", context.packageName, null)
                }
            }
            context.startActivity(intent)
        }

        AsyncFunction("checkOverlayPermission") {
            Settings.canDrawOverlays(context)
        }

        AsyncFunction("requestOverlayPermission") {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${context.packageName}")
            ).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        }

        AsyncFunction("startMonitoring") { blockedPackages: List<String> ->
            val intent = Intent(context, AppMonitorService::class.java).apply {
                action = AppMonitorService.ACTION_START
                putStringArrayListExtra(
                    AppMonitorService.EXTRA_BLOCKED,
                    ArrayList(blockedPackages)
                )
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        AsyncFunction("stopMonitoring") {
            context.startService(
                Intent(context, AppMonitorService::class.java).apply {
                    action = AppMonitorService.ACTION_STOP
                }
            )
        }

        AsyncFunction("updateBlockedPackages") { blockedPackages: List<String> ->
            context.startService(
                Intent(context, AppMonitorService::class.java).apply {
                    action = AppMonitorService.ACTION_UPDATE
                    putStringArrayListExtra(
                        AppMonitorService.EXTRA_BLOCKED,
                        ArrayList(blockedPackages)
                    )
                }
            )
        }
    }
}
