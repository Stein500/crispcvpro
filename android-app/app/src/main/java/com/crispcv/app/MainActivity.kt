package com.crispcv.app

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Bundle
import android.os.Message
import android.webkit.CookieManager
import android.webkit.DownloadListener
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.material3.Text
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import androidx.compose.material3.MaterialTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.ui.viewinterop.AndroidView
import com.crispcv.app.ui.theme.CrispCVTheme

private const val CRISPCV_URL = "https://crispcvpro.vercel.app/"

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { CrispCVTheme { CrispCVWebShell() } }
    }
}

@Composable
private fun CrispCVWebShell() {
    var webView: WebView? by remember { mutableStateOf(null) }
    var loading by remember { mutableStateOf(true) }
    var progress by remember { mutableFloatStateOf(0f) }
    var fileCallback by remember { mutableStateOf<android.webkit.ValueCallback<Array<Uri>>?>(null) }
    val filePicker = androidx.activity.compose.rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        fileCallback?.onReceiveValue(if (result.resultCode == android.app.Activity.RESULT_OK) result.data?.data?.let { arrayOf(it) } else null)
        fileCallback = null
    }

    BackHandler(enabled = webView?.canGoBack() == true) { webView?.goBack() }

    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { context ->
                WebView(context).apply {
                    webView = this
                    configureCrispWebView(context, this, { callback, intent -> fileCallback = callback; filePicker.launch(intent) }, { value -> progress = value })
                    webViewClient = object : WebViewClient() {
                        override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                            loading = true
                        }
                        override fun onPageFinished(view: WebView?, url: String?) {
                            loading = false
                        }
                        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                            val url = request.url.toString()
                            return if (url.startsWith("https://crispcvpro.vercel.app")) {
                                false
                            } else {
                                runCatching { context.startActivity(android.content.Intent(android.content.Intent.ACTION_VIEW, request.url)) }
                                true
                            }
                        }
                    }
                    loadUrl(CRISPCV_URL)
                }
            },
            update = { webView = it }
        )
        if (loading) {
            LinearProgressIndicator(progress={progress.coerceIn(0f,1f)}, modifier=Modifier.fillMaxWidth().align(Alignment.TopCenter))
            CrispSplash(progress)
        }
    }
}

@Composable
private fun CrispSplash(progress: Float) {
    val transition = rememberInfiniteTransition(label = "splash")
    val pulse by transition.animateFloat(0.94f, 1.06f, infiniteRepeatable(tween(900), RepeatMode.Reverse), label = "logoPulse")
    androidx.compose.material3.Surface(Modifier.fillMaxSize(), color=Color(0xFFFAFAF8)) {
        Column(Modifier.fillMaxSize(), horizontalAlignment=Alignment.CenterHorizontally, verticalArrangement=Arrangement.Center) {
            Image(painterResource(com.crispcv.app.R.drawable.ic_crispcv), null, Modifier.size(88.dp).graphicsLayer(scaleX=pulse,scaleY=pulse))
            Text("CrispCV", style=MaterialTheme.typography.headlineMedium, fontWeight=FontWeight.Bold, color=Color(0xFF171717), modifier=Modifier.padding(top=18.dp))
            Text("Un CV net. Le bon format.", style=MaterialTheme.typography.bodyLarge, color=Color(0xFF6B6B6B), modifier=Modifier.padding(top=6.dp))
            LinearProgressIndicator(progress={progress.coerceIn(0f,1f)}, color=Color(0xFFB23A2E), trackColor=Color(0xFFE5E2DE), modifier=Modifier.fillMaxWidth(.58f).padding(top=28.dp))
        }
    }
}

private fun configureCrispWebView(context: Context, webView: WebView, onFileChooser: (android.webkit.ValueCallback<Array<Uri>>, android.content.Intent) -> Unit, onProgress: (Float) -> Unit) {
    with(webView.settings) {
        javaScriptEnabled = true
        domStorageEnabled = true
        databaseEnabled = true
        allowFileAccess = true
        allowContentAccess = true
        builtInZoomControls = false
        displayZoomControls = false
        cacheMode = WebSettings.LOAD_DEFAULT
        mediaPlaybackRequiresUserGesture = false
        userAgentString = "$userAgentString CrispCVAndroid/2.0"
    }
    webView.setBackgroundColor(android.graphics.Color.TRANSPARENT)
    webView.overScrollMode = WebView.OVER_SCROLL_NEVER
    CookieManager.getInstance().setAcceptCookie(true)
    CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)
    webView.webChromeClient = object : WebChromeClient() {
        override fun onProgressChanged(view: WebView?, newProgress: Int) { onProgress(newProgress / 100f) }
        override fun onShowFileChooser(view: WebView?, callback: android.webkit.ValueCallback<Array<Uri>>, params: WebChromeClient.FileChooserParams): Boolean {
            onFileChooser(callback, params.createIntent())
            return true
        }
        override fun onCreateWindow(view: WebView?, isDialog: Boolean, isUserGesture: Boolean, resultMsg: Message?): Boolean {
            val transport = resultMsg?.obj as? WebView.WebViewTransport ?: return false
            transport.webView = view
            resultMsg.sendToTarget()
            return true
        }
    }
    webView.setDownloadListener(DownloadListener { url, userAgent, contentDisposition, mimeType, _ ->
        val request = DownloadManager.Request(Uri.parse(url)).apply {
            setMimeType(mimeType)
            addRequestHeader("User-Agent", userAgent)
            CookieManager.getInstance().getCookie(url)?.let { addRequestHeader("Cookie", it) }
            setTitle(android.webkit.URLUtil.guessFileName(url, contentDisposition, mimeType))
            setDescription("Téléchargement CrispCV")
            setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            setDestinationInExternalPublicDir(android.os.Environment.DIRECTORY_DOWNLOADS, android.webkit.URLUtil.guessFileName(url, contentDisposition, mimeType))
        }
        (context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager).enqueue(request)
    })
}
