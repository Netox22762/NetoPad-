# NetoPad- (Android scaffolding)

Este repositório agora contém um scaffolding Android mínimo para executar o MapperService (AccessibilityService) e uma Activity com WebView que faz a ponte entre a interface web e o serviço nativo.

O que foi adicionado:
- MainActivity (WebView) com um JavaScriptInterface chamado `NativeBridge`.
- assets/index.html: página de demonstração que chama `NativeBridge.click(x,y)` e abre as configurações de Acessibilidade.
- Layout `activity_main.xml` com WebView.
- Manifest atualizado para declarar Activity, Service e permissão INTERNET.
- README com instruções.

Como usar:
1. Abra o projeto no Android Studio ou use Gradle/CLI para compilar e instalar:
   - ./gradlew assembleDebug
   - ./gradlew installDebug

2. No dispositivo, ative o serviço de Acessibilidade em Configurações > Acessibilidade > NetoPad- (MapperService).

3. Abra o app (launcher). A WebView carregará `assets/index.html` e você poderá enviar cliques via UI.

Exemplo usando adb (com dispositivo conectado):

adb shell am broadcast -a com.seunome.mapeador.ACTION_CLICK --ei x 200 --ei y 400

Notas e próximos passos:
- O app usa broadcasts para comunicar comandos de clique para o MapperService. Se desejar uma comunicação mais segura/direta, posso implementar um bound service, sockets locais ou outro mecanismo.
- Se quiser que eu altere o `applicationId` (por exemplo para `com.netox.netopad`), diga o novo value e eu atualizo todos os arquivos relevantes e farei um novo commit.
