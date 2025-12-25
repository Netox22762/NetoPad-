package com.seunome.mapeador

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.accessibilityservice.GestureDescription
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Path
import android.os.Build
import android.util.Log
import android.view.accessibility.AccessibilityEvent

class MapperService : AccessibilityService() {

    private val TAG = "MapperService"

    private val commandReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            intent ?: return
            when (intent.action) {
                ACTION_CLICK -> {
                    val x = intent.getIntExtra(EXTRA_X, -1)
                    val y = intent.getIntExtra(EXTRA_Y, -1)
                    if (x >= 0 && y >= 0) {
                        performClick(x, y)
                    } else {
                        Log.w(TAG, "Invalid coordinates: x=$x y=$y")
                    }
                }
            }
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.i(TAG, "Service connected")

        val info = AccessibilityServiceInfo()
        info.eventTypes = AccessibilityEvent.TYPES_ALL_MASK
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
        info.flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS
        serviceInfo = info

        val filter = IntentFilter()
        filter.addAction(ACTION_CLICK)
        registerReceiver(commandReceiver, filter)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // No-op for now; the service is primarily used for synthetic gestures.
    }

    override fun onInterrupt() {
        // Clean up if needed
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            unregisterReceiver(commandReceiver)
        } catch (e: Exception) {
            // ignore
        }
    }

    private fun performClick(x: Int, y: Int) {
        Log.i(TAG, "performClick at ($x,$y)")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            val path = Path().apply { moveTo(x.toFloat(), y.toFloat()) }
            val gesture = GestureDescription.Builder()
                .addStroke(GestureDescription.StrokeDescription(path, 0, 50))
                .build()

            dispatchGesture(gesture, object : GestureResultCallback() {
                override fun onCompleted(gestureDescription: GestureDescription?) {
                    Log.i(TAG, "Gesture completed")
                }

                override fun onCancelled(gestureDescription: GestureDescription?) {
                    Log.w(TAG, "Gesture cancelled")
                }
            }, null)
        } else {
            Log.w(TAG, "Synthetic gestures require API 24+")
        }
    }

    companion object {
        const val ACTION_CLICK = "com.seunome.mapeador.ACTION_CLICK"
        const val EXTRA_X = "x"
        const val EXTRA_Y = "y"
    }
}
