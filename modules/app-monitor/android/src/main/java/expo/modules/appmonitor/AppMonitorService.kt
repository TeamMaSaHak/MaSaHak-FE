package expo.modules.appmonitor

import android.app.*
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.os.*
import android.provider.Settings
import android.view.*
import android.widget.*
import androidx.core.app.NotificationCompat

class AppMonitorService : Service() {

    companion object {
        const val ACTION_START = "ACTION_START"
        const val ACTION_STOP = "ACTION_STOP"
        const val ACTION_UPDATE = "ACTION_UPDATE"
        const val EXTRA_BLOCKED = "blocked_packages"

        private const val CHANNEL_ID = "masahak_monitor"
        private const val NOTIF_ID = 7001

        @Volatile var isActive = false
    }

    private var blockedPackages = emptySet<String>()
    private var isRunning = false
    private var monitorThread: Thread? = null

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null

    override fun onBind(intent: Intent?) = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                blockedPackages = intent.getStringArrayListExtra(EXTRA_BLOCKED)
                    ?.toHashSet() ?: emptySet()
                isActive = true
                startForeground(NOTIF_ID, buildNotification())
                startMonitorLoop()
            }
            ACTION_UPDATE -> {
                blockedPackages = intent.getStringArrayListExtra(EXTRA_BLOCKED)
                    ?.toHashSet() ?: emptySet()
                // 현재 오버레이가 허용된 앱이 됐으면 제거
                Handler(Looper.getMainLooper()).post { removeOverlayIfAllowed() }
            }
            ACTION_STOP -> stopSelf()
        }
        return START_STICKY
    }

    private fun startMonitorLoop() {
        if (isRunning) return
        isRunning = true

        monitorThread = Thread {
            val usm = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val pm = packageManager
            var lastDetected: String? = null

            while (isRunning) {
                val now = System.currentTimeMillis()
                val foreground = usm
                    .queryUsageStats(UsageStatsManager.INTERVAL_DAILY, now - 3000, now)
                    ?.filter { it.lastTimeUsed > 0 }
                    ?.maxByOrNull { it.lastTimeUsed }
                    ?.packageName

                if (foreground != null && foreground in blockedPackages) {
                    if (lastDetected != foreground) {
                        lastDetected = foreground
                        val appName = try {
                            @Suppress("DEPRECATION")
                            pm.getApplicationLabel(pm.getApplicationInfo(foreground, 0)).toString()
                        } catch (_: Exception) {
                            foreground
                        }
                        Handler(Looper.getMainLooper()).post { showOverlay(appName) }
                    }
                } else {
                    if (lastDetected != null) {
                        lastDetected = null
                        Handler(Looper.getMainLooper()).post { removeOverlay() }
                    }
                }

                Thread.sleep(1000)
            }
        }.also { it.isDaemon = true }

        monitorThread?.start()
    }

    private fun showOverlay(appName: String) {
        if (!Settings.canDrawOverlays(this)) return
        if (overlayView != null) return

        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

        val root = FrameLayout(this).apply {
            setBackgroundColor(Color.parseColor("#E6000000"))
        }

        val center = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(64, 0, 64, 0)
        }

        val emoji = TextView(this).apply {
            text = "🧙"
            textSize = 56f
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 24)
        }

        val title = TextView(this).apply {
            text = "집중 시간!"
            textSize = 26f
            setTextColor(Color.WHITE)
            setTypeface(typeface, Typeface.BOLD)
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 12)
        }

        val desc = TextView(this).apply {
            text = "'$appName'은(는) 비허용 상태예요.\n마법사관학교로 돌아가 집중하세요."
            textSize = 14f
            setTextColor(Color.parseColor("#CCCCCC"))
            gravity = Gravity.CENTER
            setLineSpacing(0f, 1.4f)
            setPadding(0, 0, 0, 40)
        }

        val btn = Button(this).apply {
            text = "돌아가기"
            textSize = 15f
            setTextColor(Color.BLACK)
            setTypeface(typeface, Typeface.BOLD)
            background = createRoundedBackground()
            setPadding(48, 24, 48, 24)
            setOnClickListener {
                removeOverlay()
                bringAppToFront()
            }
        }

        val hint = TextView(this).apply {
            text = "타이머를 끄면 모든 앱을 사용할 수 있어요"
            textSize = 12f
            setTextColor(Color.parseColor("#888888"))
            gravity = Gravity.CENTER
            setPadding(0, 20, 0, 0)
        }

        center.addView(emoji)
        center.addView(title)
        center.addView(desc)
        center.addView(btn)
        center.addView(hint)

        root.addView(
            center,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.CENTER
            )
        )

        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else
            @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            type,
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        )

        try {
            overlayView = root
            windowManager?.addView(root, params)
        } catch (e: Exception) {
            overlayView = null
        }
    }

    private fun removeOverlay() {
        overlayView?.let {
            try { windowManager?.removeView(it) } catch (_: Exception) {}
            overlayView = null
        }
    }

    private fun removeOverlayIfAllowed() {
        // 현재 오버레이가 표시 중이고 해당 앱이 허용됐으면 제거
        if (overlayView != null) removeOverlay()
    }

    private fun bringAppToFront() {
        val intent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
        } ?: return
        startActivity(intent)
    }

    private fun createRoundedBackground(): android.graphics.drawable.GradientDrawable {
        return android.graphics.drawable.GradientDrawable().apply {
            setColor(Color.WHITE)
            cornerRadius = 50f
        }
    }

    private fun buildNotification(): Notification {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "집중 모드 모니터링",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                setShowBadge(false)
            }
            getSystemService(NotificationManager::class.java)
                .createNotificationChannel(channel)
        }

        val launchIntent = packageManager
            .getLaunchIntentForPackage(packageName)
            ?.apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val iconRes = resources.getIdentifier("ic_launcher", "mipmap", packageName)
            .takeIf { it != 0 } ?: android.R.drawable.ic_menu_compass

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("집중 모드 활성화")
            .setContentText("비허용 앱 차단 중")
            .setSmallIcon(iconRes)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    override fun onDestroy() {
        isActive = false
        isRunning = false
        removeOverlay()
        monitorThread?.interrupt()
        super.onDestroy()
    }
}
