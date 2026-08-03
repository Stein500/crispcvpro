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
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
                    configureCrispWebView(context, this) { callback, intent -> fileCallback = callback; filePicker.launch(intent) }
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
        if (loading) CircularProgressIndicator()
    }
}

private fun configureCrispWebView(context: Context, webView: WebView, onFileChooser: (android.webkit.ValueCallback<Array<Uri>>, android.content.Intent) -> Unit) {
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
