
import React, { useState } from 'react';
import { X, Clipboard, Check } from 'lucide-react';

const files = {
  'MapperLogic.txt': {
    language: 'kotlin',
    content: `// Este é o código Kotlin completo para o MapperService.
// Ele agora inclui a lógica para SALVAR e CARREGAR as posições dos botões.

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
    
    // Mapas para gerenciar múltiplos botões e suas coordenadas
    private val floatingButtons = mutableMapOf<Int, ImageView>()
    private val buttonCoordinates = mutableMapOf<Int, Pair<Float, Float>>()

    // Mapeia os botões que queremos criar
    private val buttonsToCreate = mapOf(
        KeyEvent.KEYCODE_BUTTON_A to Color.BLUE,
        KeyEvent.KEYCODE_BUTTON_B to Color.RED,
        KeyEvent.KEYCODE_BUTTON_X to Color.GREEN,
        KeyEvent.KEYCODE_BUTTON_Y to Color.YELLOW
    )

    // Estado para teclas modificadoras (para combos)
    private var isLTPressed = false
    private var isRTPressed = false

    // Chamado quando o serviço é conectado pelo sistema
    override fun onServiceConnected() {
        super.onServiceConnected()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        // Inicializa o SharedPreferences para salvar/carregar dados
        prefs = getSharedPreferences("ConfigMapeador", Context.MODE_PRIVATE)
        
        loadAllButtonPositions()
        setupAllOverlays()
    }

    // Carrega TODAS as posições salvas do SharedPreferences
    private fun loadAllButtonPositions() {
        buttonsToCreate.keys.forEach { keyCode ->
            val x = prefs.getFloat("pos_\${keyCode}_x", -1f)
            val y = prefs.getFloat("pos_\${keyCode}_y", -1f)
            if (x != -1f) {
                buttonCoordinates[keyCode] = x to y
            }
        }
    }

    // Salva a posição de UM botão específico
    private fun saveButtonPosition(keyCode: Int, x: Float, y: Float) {
        val editor = prefs.edit()
        editor.putFloat("pos_\${keyCode}_x", x)
        editor.putFloat("pos_\${keyCode}_y", y)
        editor.apply() // Salva de verdade
    }

    // Cria todos os botões flutuantes que precisamos
    private fun setupAllOverlays() {
        var initialXOffset = 0
        buttonsToCreate.forEach { (keyCode, color) ->
            // Usa a posição salva, ou calcula uma posição inicial padrão se não houver
            val initialX = buttonCoordinates[keyCode]?.first?.toInt() ?: (100 + initialXOffset)
            val initialY = buttonCoordinates[keyCode]?.second?.toInt() ?: 100
            createFloatingButton(keyCode, color, initialX, initialY)
            initialXOffset += 120 // Espaça os botões caso não tenham sido salvos ainda
        }
    }

    private fun createFloatingButton(keyCode: Int, color: Int, initialX: Int, initialY: Int) {
        val buttonView = ImageView(this).apply {
            setBackgroundColor(Color.argb(128, Color.red(color), Color.green(color), Color.blue(color)))
        }

        val params = WindowManager.LayoutParams(
            100, 100,
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            x = initialX
            y = initialY
        }

        // Lógica para arrastar e salvar a posição
        buttonView.setOnTouchListener { view, event ->
            when (event.action) {
                MotionEvent.ACTION_MOVE -> {
                    params.x = (event.rawX - view.width / 2).toInt()
                    params.y = (event.rawY - view.height / 2).toInt()
                    windowManager.updateViewLayout(view, params)
                    buttonCoordinates[keyCode] = event.rawX to event.rawY
                }
                MotionEvent.ACTION_UP -> {
                    // Quando o usuário solta o botão, SALVA a posição!
                    val currentCoords = buttonCoordinates[keyCode]
                    if (currentCoords != null) {
                        saveButtonPosition(keyCode, currentCoords.first, currentCoords.second)
                    }
                }
            }
            true
        }

        windowManager.addView(buttonView, params)
        floatingButtons[keyCode] = buttonView
    }
    
    // Simula um toque físico em coordenadas X e Y
    private fun executeTouch(x: Float, y: Float) {
        val path = Path().apply { moveTo(x, y) }
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 50))
            .build()
        dispatchGesture(gesture, null, null)
    }

    override fun onKeyEvent(event: KeyEvent): Boolean {
        val keyCode = event.keyCode

        when (keyCode) {
            KeyEvent.KEYCODE_BUTTON_L2 -> isLTPressed = (event.action == KeyEvent.ACTION_DOWN)
            KeyEvent.KEYCODE_BUTTON_R2 -> isRTPressed = (event.action == KeyEvent.ACTION_DOWN)
        }

        if (event.action == KeyEvent.ACTION_DOWN) {
            val coords = buttonCoordinates[keyCode]
            if (coords != null) {
                if (isLTPressed && keyCode == KeyEvent.KEYCODE_BUTTON_A) {
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
}`
  },
  'AndroidManifest.xml': {
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<!-- 
  Este é um arquivo de configuração para um projeto Android nativo.
  Ele deve ser colocado na raiz do diretório 'app/src/main/' no Android Studio.
-->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.seunome.mapeador">

    <!-- Permissões para conectividade com Gamepad -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <!-- NOVA Permissão para desenhar sobre outros apps (Overlay) -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />


    <application>
        <!-- Outras configurações de aplicativo, como sua Activity principal, iriam aqui -->

        <!-- Definição do Serviço de Acessibilidade -->
        <service
            android:name=".MapperService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <!-- Link para o arquivo de configuração do serviço -->
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>
    </application>

</manifest>`
  },
  'accessibility_service_config.xml': {
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<!-- 
  Este é um arquivo de configuração de recursos para um projeto Android nativo.
  Ele deve ser colocado no diretório 'app/src/main/res/xml/' no Android Studio.
-->
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeAllMask"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows"
    android:canPerformGestures="true"
    android:canRetrieveWindowContent="true"
    android:notificationTimeout="100" />

<!--
Pontos importantes:
- android:canPerformGestures="true": É o que permite o clique real.
- android:accessibilityFlags="flagRetrieveInteractiveWindows": Ajuda o serviço a "ver" melhor a tela.
- Lembrete: Ao testar no celular, você terá que ir em Configurações > Acessibilidade 
  e ativar o serviço do app manualmente.
-->`
  }
};

type FileName = keyof typeof files;

interface NativeCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NativeCodeViewerModal: React.FC<NativeCodeViewerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<FileName>('MapperLogic.txt');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeTab].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col p-6 m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-cyan-400">Visualizador de Código Nativo</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>
        <div className="border-b border-slate-600">
            <nav className="-mb-px flex gap-4">
                {(Object.keys(files) as FileName[]).map(name => (
                    <button 
                        key={name}
                        onClick={() => setActiveTab(name)}
                        className={`py-2 px-4 font-semibold border-b-2 transition-colors ${activeTab === name ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                        {name}
                    </button>
                ))}
            </nav>
        </div>
        <div className="relative flex-grow bg-slate-900/50 mt-4 rounded-lg overflow-hidden">
            <button onClick={handleCopy} className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-lg transition-colors flex items-center gap-2">
                {copied ? <Check size={16} className="text-green-400"/> : <Clipboard size={16} />}
                {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <pre className="h-full w-full overflow-auto p-4 text-sm text-slate-200">
                <code className={`language-${files[activeTab].language}`}>
                    {files[activeTab].content}
                </code>
            </pre>
        </div>
      </div>
    </div>
  );
};

export default NativeCodeViewerModal;
