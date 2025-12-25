package com.seunome.mapeador

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.content.Context
import android.content.SharedPreferences
import android.graphics.Path
import android.graphics.PixelFormat
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.widget.ImageView
import android.graphics.Color

class MapperService : AccessibilityService() {

    private lateinit var windowManager: WindowManager
    private lateinit var prefs: SharedPreferences
    
    private val buttonCoordinates = mutableMapOf<Int, Pair<Float, Float>>()
    private val floatingButtons = mutableMapOf<Int, ImageView>()

    // Dicionário completo de botões
    private val buttonsToCreate = mapOf(
        KeyEvent.KEYCODE_BUTTON_A to Color.BLUE,
        KeyEvent.KEYCODE_BUTTON_B to Color.RED,
        KeyEvent.KEYCODE_BUTTON_X to Color.GREEN,
        KeyEvent.KEYCODE_BUTTON_Y to Color.YELLOW,
        KeyEvent.KEYCODE_DPAD_UP to Color.WHITE,
        KeyEvent.KEYCODE_DPAD_DOWN to Color.WHITE,
        KeyEvent.KEYCODE_DPAD_LEFT to Color.WHITE,
        KeyEvent.KEYCODE_DPAD_RIGHT to Color.WHITE,
        KeyEvent.KEYCODE_BUTTON_L1 to Color.GRAY, // LB
        KeyEvent.KEYCODE_BUTTON_R1 to Color.GRAY, // RB
        KeyEvent.KEYCODE_BUTTON_START to Color.MAGENTA,
        KeyEvent.KEYCODE_BUTTON_SELECT to Color.MAGENTA,
        KeyEvent.KEYCODE_BUTTON_THUMBL to Color.CYAN, // L3 / LSB
        KeyEvent.KEYCODE_BUTTON_THUMBR to Color.CYAN  // R3 / RSB
    )

    private var isLTPressed = false
    private var isRTPressed = false

    override fun onServiceConnected() {
        super.onServiceConnected()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        prefs = getSharedPreferences("ConfigMapeador", Context.MODE_PRIVATE)
        
        loadAllButtonPositions()
        setupAllOverlays()
    }

    private fun loadAllButtonPositions() {
        buttonsToCreate.keys.forEach { keyCode ->
            val x = prefs.getFloat("pos_${keyCode}_x", -1f)
            val y = prefs.getFloat("pos_${keyCode}_y", -1f)
            if (x != -1f) {
                buttonCoordinates[keyCode] = x to y
            }
        }
    }

    private fun saveButtonPosition(keyCode: Int, x: Float, y: Float) {
        val editor = prefs.edit()
        editor.putFloat("pos_${keyCode}_x", x)
        editor.putFloat("pos_${keyCode}_y", y)
        editor.apply()
    }

    private fun setupAllOverlays() {
        var offset = 0
        buttonsToCreate.forEach { (keyCode, color) ->
            val initialX = buttonCoordinates[keyCode]?.first?.toInt() ?: (50 + offset)
            val initialY = buttonCoordinates[keyCode]?.second?.toInt() ?: 150
            createFloatingButton(keyCode, color, initialX, initialY)
            offset += 60 
        }
    }

    private fun createFloatingButton(keyCode: Int, color: Int, initialX: Int, initialY: Int) {
        val buttonView = ImageView(this).apply {
            // Bolinha semi-transparente
            setBackgroundColor(Color.argb(140, Color.red(color), Color.green(color), Color.blue(color)))
        }

        val params = WindowManager.LayoutParams(
            85, 85, // Tamanho da bolinha
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            x = initialX
            y = initialY
        }

        buttonView.setOnTouchListener { view, event ->
            when (event.action) {
                MotionEvent.ACTION_MOVE -> {
                    params.x = (event.rawX - view.width / 2).toInt()
                    params.y = (event.rawY - view.height / 2).toInt()
                    windowManager.updateViewLayout(view, params)
                    buttonCoordinates[keyCode] = event.rawX to event.rawY
                }
                MotionEvent.ACTION_UP -> {
                    buttonCoordinates[keyCode]?.let { saveButtonPosition(keyCode, it.first, it.second) }
                }
            }
            true
        }

        windowManager.addView(buttonView, params)
        floatingButtons[keyCode] = buttonView
    }
    
    private fun executeTouch(x: Float, y: Float) {
        val path = Path().apply { moveTo(x, y) }
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 40)) // Toque rápido
            .build()
        dispatchGesture(gesture, null, null)
    }

    override fun onKeyEvent(event: KeyEvent): Boolean {
        val keyCode = event.keyCode
        
        // Triggers (LT/RT) funcionam como modificadores de combo
        if (keyCode == KeyEvent.KEYCODE_BUTTON_L2) isLTPressed = (event.action == KeyEvent.ACTION_DOWN)
        if (keyCode == KeyEvent.KEYCODE_BUTTON_R2) isRTPressed = (event.action == KeyEvent.ACTION_DOWN)

        if (event.action == KeyEvent.ACTION_DOWN) {
            val coords = buttonCoordinates[keyCode]
            if (coords != null) {
                // Se estiver segurando LT, o toque é deslocado (exemplo de macro)
                if (isLTPressed) {
                    executeTouch(coords.first, coords.second - 100)
                } else {
                    executeTouch(coords.first, coords.second)
                }
                return true
            }
        }
        return super.onKeyEvent(event)
    }

    override fun onInterrupt() {
        floatingButtons.values.forEach { if(it.isAttachedToWindow) windowManager.removeView(it) }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
}
