package com.seunome.mapeador

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private val TAG = "MainActivity"
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)
        webView.webChromeClient = WebChromeClient()
        val ws: WebSettings = webView.settings
        ws.javaScriptEnabled = true
        ws.allowFileAccess = true

        webView.addJavascriptInterface(NativeBridge(), "NativeBridge")
        webView.loadUrl("file:///android_asset/index.html")
    }

    inner class NativeBridge {
        @JavascriptInterface
        fun click(x: Int, y: Int) {
            Log.i(TAG, "NativeBridge.click($x,$y)")
            val intent = Intent(MapperService.ACTION_CLICK)
            intent.putExtra(MapperService.EXTRA_X, x)
            intent.putExtra(MapperService.EXTRA_Y, y)
            sendBroadcast(intent)
        }

        @JavascriptInterface
        fun openAccessibilitySettings() {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(intent)
        }
    }
}
