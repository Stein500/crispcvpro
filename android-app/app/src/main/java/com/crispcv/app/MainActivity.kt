package com.crispcv.app

import android.content.Context
import android.graphics.Paint
import android.graphics.BitmapFactory
import android.graphics.pdf.PdfDocument
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import android.net.Uri
import android.os.Bundle
import java.io.FileOutputStream
import org.json.JSONObject
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.compose.*
import com.crispcv.app.ui.theme.CrispCVTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); setContent { CrispCVTheme { CrispCVApp() } } }
}

private val Red = Color(0xFFB23A2E)
private val Soft = Color(0xFFF5F1F4)

@Composable fun CrispCVApp() {
    val nav = rememberNavController(); val entry by nav.currentBackStackEntryAsState(); val route = entry?.destination?.route
    Scaffold(containerColor=Color(0xFFFAFAF8), bottomBar = { NavigationBar(containerColor=Color(0xFFF4EFF8), tonalElevation=0.dp) { listOf("home" to Icons.Default.Home, "studio" to Icons.Default.Description, "convert" to Icons.Default.SwapHoriz).forEach { (r, icon) -> NavigationBarItem(selected=route==r, onClick={ nav.navigate(r) { launchSingleTop=true } }, icon={ Icon(icon, null) }, label={Text(mapOf("home" to "Accueil", "studio" to "Mes CV", "guides" to "Guides", "convert" to "Convertir")[r]!!)}, colors=NavigationBarItemDefaults.colors(selectedIconColor=Color(0xFF241B2F),selectedTextColor=Color(0xFF241B2F),indicatorColor=Color(0xFFE8DDFC),unselectedIconColor=Color(0xFF4C4650),unselectedTextColor=Color(0xFF4C4650)) ) } }}) { pad ->
        AnimatedContent(targetState=route ?: "home", transitionSpec={ fadeIn() togetherWith fadeOut() }, label="navigation") { NavHost(nav, "home", Modifier.padding(pad)) { composable("home") { HomeScreen { nav.navigate("studio") } }; composable("studio") { StudioScreen() }; composable("convert") { ConverterScreen() } } }
    }
}

@Composable private fun HomeScreen(openStudio: () -> Unit) { LazyColumn(Modifier.fillMaxSize().padding(24.dp), verticalArrangement=Arrangement.spacedBy(20.dp)) {
    item { Spacer(Modifier.height(18.dp)); Text("CrispCV", color=Red, fontWeight=FontWeight.Bold); Text("Un CV net.\nLe bon format.", style=MaterialTheme.typography.displaySmall, fontWeight=FontWeight.Bold); Text("Votre candidature, créée localement sur votre téléphone. Sans compte, sans filigrane, sans piège.", style=MaterialTheme.typography.bodyLarge) }
    item { Button(openStudio, Modifier.fillMaxWidth().height(56.dp), shape=RoundedCornerShape(30.dp)) { Icon(Icons.Default.Add, null); Spacer(Modifier.width(8.dp)); Text("Créer mon CV") } }
    item { Text("Tout ce dont vous avez besoin", style=MaterialTheme.typography.titleLarge, fontWeight=FontWeight.Bold) }
    item { FeatureCard(Icons.Default.Lock, "Confidentiel par défaut", "Vos données restent sur votre appareil.") }; item { FeatureCard(Icons.Default.PictureAsPdf, "PDF professionnel", "Export prêt à envoyer, même hors connexion.") }; item { FeatureCard(Icons.Default.AutoAwesome, "Des modèles qui vous ressemblent", "Une mise en page claire, lisible et moderne.") }
} }

@Composable private fun StudioScreen() {
    val context=androidx.compose.ui.platform.LocalContext.current; val prefs=context.getSharedPreferences("crispcv",Context.MODE_PRIVATE)
    var name by remember { mutableStateOf(prefs.getString("name","") ?: "") }; var title by remember { mutableStateOf(prefs.getString("title","") ?: "") }; var email by remember { mutableStateOf(prefs.getString("email","") ?: "") }; var city by remember { mutableStateOf(prefs.getString("city","") ?: "") }; var summary by remember { mutableStateOf(prefs.getString("summary","") ?: "") }; var skills by remember { mutableStateOf(prefs.getString("skills","") ?: "") }; var template by remember { mutableStateOf(prefs.getString("template","Essentiel") ?: "Essentiel") }; val experiences=remember { mutableStateListOf(*prefs.getStringSet("experiences", emptySet())!!.toTypedArray()) }; val educations=remember { mutableStateListOf(*prefs.getStringSet("educations", emptySet())!!.toTypedArray()) }; var saved by remember { mutableStateOf(false) }
    val save={ prefs.edit().putString("name",name).putString("title",title).putString("email",email).putString("city",city).putString("summary",summary).putStringSet("experiences",experiences.toSet()).putStringSet("educations",educations.toSet()).putString("skills",skills).putString("template",template).apply(); saved=true }
    val create=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/pdf")){ uri -> if(uri!=null){ writeCvPdf(context,uri,name,title,email,city,summary,experiences.joinToString(" • "),educations.joinToString(" • "),skills,template); shareFile(context,uri,"application/pdf") } }; val exportJson=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/json")){ uri -> if(uri!=null) context.contentResolver.openOutputStream(uri)?.use{it.write(JSONObject().put("name",name).put("title",title).put("email",email).put("city",city).put("summary",summary).put("skills",skills).put("experiences",experiences.joinToString("\n")).put("educations",educations.joinToString("\n")).toString(2).toByteArray())} }; val importJson=rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()){ uri -> if(uri!=null){ val json=context.contentResolver.openInputStream(uri)?.bufferedReader()?.readText()?.let{JSONObject(it)}; if(json!=null){name=json.optString("name",name);title=json.optString("title",title);email=json.optString("email",email);city=json.optString("city",city);summary=json.optString("summary",summary);skills=json.optString("skills",skills);experiences.clear();experiences.addAll(json.optString("experiences","").split("\n").filter{it.isNotBlank()});educations.clear();educations.addAll(json.optString("educations","").split("\n").filter{it.isNotBlank()})}}}
    LazyColumn(Modifier.fillMaxSize().padding(24.dp), verticalArrangement=Arrangement.spacedBy(14.dp)) {
        item { Text("Mon CV", style=MaterialTheme.typography.headlineMedium, fontWeight=FontWeight.Bold); Text("Tout est enregistré sur ce téléphone.", color=MaterialTheme.colorScheme.onSurfaceVariant) }; item { TemplatePicker(template){template=it;saved=false} }; item { PreviewCard(name,title,template) }
        item { SectionTitle("Coordonnées") }; item { Field("Nom complet",name){name=it;saved=false} }; item { Field("Titre professionnel",title){title=it;saved=false} }; item { Field("E-mail",email){email=it;saved=false} }; item { Field("Ville / pays",city){city=it;saved=false} }
        item { SectionTitle("Profil professionnel") }; item { OutlinedTextField(summary,{summary=it;saved=false},label={Text("Votre résumé en 3 à 4 lignes")},modifier=Modifier.fillMaxWidth(),minLines=4) }
        item { Row(horizontalArrangement=Arrangement.spacedBy(10.dp),modifier=Modifier.fillMaxWidth()){ Button(save,Modifier.weight(1f)){Icon(Icons.Default.Save,null);Spacer(Modifier.width(6.dp));Text(if(saved)"Enregistré" else "Sauvegarder")}; OutlinedButton({create.launch("CV-${name.ifBlank{"CrispCV"}}.pdf")},Modifier.weight(1f)){Icon(Icons.Default.PictureAsPdf,null);Spacer(Modifier.width(6.dp));Text("Exporter PDF")} } }; item { Row(horizontalArrangement=Arrangement.spacedBy(10.dp),modifier=Modifier.fillMaxWidth()){ OutlinedButton({exportJson.launch("CrispCV-profil.json")},Modifier.weight(1f)){Text("Exporter JSON")}; OutlinedButton({importJson.launch(arrayOf("application/json","text/plain"))},Modifier.weight(1f)){Text("Importer JSON")} } }
        item { SectionTitle("Expériences professionnelles") }; items(experiences){ value -> RowEditor(value,{experiences[experiences.indexOf(value)]=it;saved=false},{experiences.remove(value);saved=false}) }; item { OutlinedButton({experiences.add("")},Modifier.fillMaxWidth()){Icon(Icons.Default.Add,null);Spacer(Modifier.width(6.dp));Text("Ajouter une expérience")} }; item { SectionTitle("Formations") }; items(educations){ value -> RowEditor(value,{educations[educations.indexOf(value)]=it;saved=false},{educations.remove(value);saved=false}) }; item { OutlinedButton({educations.add("")},Modifier.fillMaxWidth()){Icon(Icons.Default.Add,null);Spacer(Modifier.width(6.dp));Text("Ajouter une formation")} }; item { SectionTitle("Compétences") }; item { OutlinedTextField(skills,{skills=it;saved=false},label={Text("Ex. Excel, vente, communication…")},modifier=Modifier.fillMaxWidth(),minLines=2) }
    }
}
@Composable private fun TemplatePicker(selected:String,onSelect:(String)->Unit){ var expanded by remember{mutableStateOf(false)}; Box{ OutlinedButton({expanded=true},Modifier.fillMaxWidth()){Icon(Icons.Default.Palette,null);Spacer(Modifier.width(8.dp));Text("Modèle : $selected")}; DropdownMenu(expanded,{expanded=false}){listOf("Essentiel","Latitude","Moderne").forEach{t->DropdownMenuItem({Text(t)}, {onSelect(t);expanded=false})}} } }
@Composable private fun PreviewCard(name:String,title:String,template:String){
    Card(Modifier.fillMaxWidth(),colors=CardDefaults.cardColors(containerColor=Color(0xFFF4F1EE))){ Column(Modifier.padding(14.dp)){ Text("APERÇU A4 · $template",style=MaterialTheme.typography.labelSmall,color=Red); Spacer(Modifier.height(8.dp)); Card(Modifier.fillMaxWidth().height(390.dp),colors=CardDefaults.cardColors(containerColor=Color.White),shape=RoundedCornerShape(4.dp)){ Row(Modifier.fillMaxSize()){ if(template=="Latitude") Box(Modifier.width(76.dp).fillMaxHeight().padding(8.dp),contentAlignment=Alignment.TopCenter){Text("COMPÉTENCES\n\nLANGUES\n\nCONTACT",style=MaterialTheme.typography.labelSmall,color=Color(0xFF53635B))}; Column(Modifier.padding(18.dp).fillMaxWidth()){ if(template=="Moderne") Box(Modifier.fillMaxWidth().height(30.dp).padding(bottom=10.dp).then(Modifier),contentAlignment=Alignment.CenterStart){Text("CRISPCV",style=MaterialTheme.typography.labelSmall,color=Color(0xFFB23A2E))}; Text(name.ifBlank{"Votre nom"},style=MaterialTheme.typography.titleMedium,fontWeight=FontWeight.Bold); Text(title.ifBlank{"Votre titre professionnel"},style=MaterialTheme.typography.labelMedium,color=Red); Divider(Modifier.padding(vertical=9.dp)); listOf("PROFIL","EXPÉRIENCE","FORMATION","COMPÉTENCES").forEach{ section -> Text(section,style=MaterialTheme.typography.labelSmall,color=Red,fontWeight=FontWeight.Bold); Spacer(Modifier.height(4.dp)); repeat(2){ Text("Ligne de contenu professionnel…",style=MaterialTheme.typography.labelSmall,color=Color.Gray) }; Spacer(Modifier.height(9.dp)) } } } } } } }
@Composable private fun Field(label:String,value:String,onChange:(String)->Unit)=OutlinedTextField(value,onChange,label={Text(label)},modifier=Modifier.fillMaxWidth(),singleLine=true)
@Composable private fun RowEditor(value:String,onChange:(String)->Unit,onRemove:()->Unit){ Row(verticalAlignment=Alignment.CenterVertically){ OutlinedTextField(value,onChange,label={Text("Poste, établissement ou réalisation")},modifier=Modifier.weight(1f),minLines=2); IconButton(onRemove){Icon(Icons.Default.Delete,contentDescription="Supprimer")} } }
@Composable private fun SectionTitle(text:String)=Text(text,style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold,modifier=Modifier.padding(top=8.dp))

@Composable private fun GuidesScreen() { var selected by remember { mutableStateOf<String?>(null) }; val guide=selected; if(guide!=null) { LazyColumn(Modifier.fillMaxSize().padding(24.dp), verticalArrangement=Arrangement.spacedBy(14.dp)) { item { Text(guide,style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold); Text("Leçon CrispCV",color=Red) }; item { Text(if(guide.startsWith("Analyse")) "Repérez les verbes conjugués, délimitez les propositions, puis identifiez leur nature et leur rôle. Une proposition indépendante ne dépend d'aucune autre. La principale commande une subordonnée. La relative complète un antécédent avec qui, que, dont ou où." else "Une ressource pratique CrispCV pour préparer votre candidature efficacement.",style=MaterialTheme.typography.bodyLarge); Button({selected=null}) { Text("Retour aux guides") } } } } else LazyColumn(Modifier.fillMaxSize().padding(24.dp),verticalArrangement=Arrangement.spacedBy(14.dp)) { item { Text("Guides utiles",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold) }; items(listOf("Analyse logique des phrases","Bien rédiger son CV","Préparer un entretien")) { title -> Card({selected=title},Modifier.fillMaxWidth()) { ListItem({Text(title,fontWeight=FontWeight.SemiBold)},leadingContent={Icon(Icons.AutoMirrored.Filled.MenuBook,null)}) } } } }
@Composable private fun ConverterScreen() { var uris by remember { mutableStateOf<List<Uri>>(emptyList()) }; var pdfUris by remember { mutableStateOf<List<Uri>>(emptyList()) }; var compressUri by remember { mutableStateOf<Uri?>(null) }; var message by remember { mutableStateOf("Choisissez une ou plusieurs images") }; val context=androidx.compose.ui.platform.LocalContext.current; val picker=rememberLauncherForActivityResult(ActivityResultContracts.OpenMultipleDocuments()){ selected->uris=selected; message=if(selected.isEmpty()) "Choisissez une ou plusieurs images" else "${selected.size} image(s) sélectionnée(s)" }; val pickerPdf=rememberLauncherForActivityResult(ActivityResultContracts.OpenMultipleDocuments()){ selected->pdfUris=selected; message="${selected.size} PDF sélectionné(s)" }; val pickerCompress=rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()){ selected->compressUri=selected; message="PDF prêt à compresser" }; val savePdf=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/pdf")){ out-> if(out!=null && uris.isNotEmpty()){ writeImagesPdf(context,uris,out); message="PDF créé avec succès"; shareFile(context,out,"application/pdf") } }; val saveMerged=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/pdf")){ out-> if(out!=null && pdfUris.isNotEmpty()){ mergePdfs(context,pdfUris,out); message="PDF fusionné avec succès"; shareFile(context,out,"application/pdf") } }; val saveCompressed=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/pdf")){ out-> if(out!=null && compressUri!=null){ if(compressPdf(context,compressUri!!,out)){ message="PDF compressé avec succès"; shareFile(context,out,"application/pdf") } else { message="Impossible de compresser ce PDF. Essayez un autre fichier." } } }; LazyColumn(Modifier.fillMaxSize().padding(24.dp),verticalArrangement=Arrangement.spacedBy(16.dp)) { item { Text("Convertisseur",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold); Text("Les fichiers restent sur votre appareil.",color=MaterialTheme.colorScheme.onSurfaceVariant) }; item { Card(Modifier.fillMaxWidth(),colors=CardDefaults.cardColors(containerColor=Soft)) { Column(Modifier.padding(22.dp),horizontalAlignment=Alignment.CenterHorizontally) { Icon(Icons.Default.UploadFile,null,tint=Red,modifier=Modifier.size(48.dp)); Text("Images vers PDF",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold); Text(message); Button({picker.launch(arrayOf("image/*"))},Modifier.padding(top=12.dp)){Text("Choisir des images")} } } }; item { if(uris.isNotEmpty()) Button({savePdf.launch("CrispCV-images.pdf")},Modifier.fillMaxWidth()){Icon(Icons.Default.PictureAsPdf,null);Spacer(Modifier.width(8.dp));Text("Créer un PDF de ${uris.size} page(s)")} }; item { OutlinedButton({pickerPdf.launch(arrayOf("application/pdf"))},Modifier.fillMaxWidth()){Icon(Icons.Default.MergeType,null);Spacer(Modifier.width(8.dp));Text("Choisir des PDF à fusionner")} }; item { if(pdfUris.isNotEmpty()) Button({saveMerged.launch("CrispCV-fusion.pdf")},Modifier.fillMaxWidth()){Text("Fusionner ${pdfUris.size} PDF")} }; item { OutlinedButton({pickerCompress.launch(arrayOf("application/pdf"))},Modifier.fillMaxWidth()){Icon(Icons.Default.Compress,null);Spacer(Modifier.width(8.dp));Text("Choisir un PDF à compresser")} }; item { if(compressUri!=null) Button({saveCompressed.launch("CrispCV-compress.pdf")},Modifier.fillMaxWidth()){Text("Compresser et partager")} }; item { FeatureCard(Icons.Default.Compress,"Compression locale","Réduction de la qualité des images pour alléger le PDF.") }; item { FeatureCard(Icons.Default.MergeType,"Fusion de PDF","Sélectionnez plusieurs PDF puis réunissez-les dans un seul document.") } } }

private fun shareFile(context: Context, uri: Uri, mime: String) { val intent=android.content.Intent(android.content.Intent.ACTION_SEND).apply{type=mime;putExtra(android.content.Intent.EXTRA_STREAM,uri);addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION)}; context.startActivity(android.content.Intent.createChooser(intent,"Partager avec…")) }

private fun compressPdf(context: Context, source: Uri, output: Uri): Boolean {
    var temp: java.io.File? = null
    var renderer: PdfRenderer? = null
    var fd: ParcelFileDescriptor? = null
    var doc: PdfDocument? = null
    return try {
        temp = java.io.File.createTempFile("crispcv-compress", ".pdf", context.cacheDir)
        context.contentResolver.openInputStream(source)?.use { input ->
            temp!!.outputStream().use { outputStream -> input.copyTo(outputStream) }
        } ?: return false
        fd = ParcelFileDescriptor.open(temp, ParcelFileDescriptor.MODE_READ_ONLY)
        renderer = PdfRenderer(fd!!)
        if (renderer!!.pageCount == 0) return false
        doc = PdfDocument()
        for (index in 0 until renderer!!.pageCount) {
            val src = renderer!!.openPage(index)
            try {
                val ratio = minOf(0.68f, 1500f / maxOf(src.width, src.height).toFloat())
                val width = (src.width * ratio).toInt().coerceAtLeast(1)
                val height = (src.height * ratio).toInt().coerceAtLeast(1)
                val bitmap = android.graphics.Bitmap.createBitmap(width, height, android.graphics.Bitmap.Config.RGB_565)
                try {
                    src.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_PRINT)
                    val page = doc!!.startPage(PdfDocument.PageInfo.Builder(width, height, index + 1).create())
                    page.canvas.drawBitmap(bitmap, 0f, 0f, Paint(Paint.ANTI_ALIAS_FLAG))
                    doc!!.finishPage(page)
                } finally {
                    bitmap.recycle()
                }
            } finally {
                src.close()
            }
        }
        context.contentResolver.openOutputStream(output)?.use { doc!!.writeTo(it) } ?: return false
        true
    } catch (_: Exception) {
        false
    } finally {
        try { doc?.close() } catch (_: Exception) { }
        try { renderer?.close() } catch (_: Exception) { }
        try { fd?.close() } catch (_: Exception) { }
        try { temp?.delete() } catch (_: Exception) { }
    }
}

private fun mergePdfs(context: Context, sources: List<Uri>, output: Uri) { val doc=PdfDocument(); var pageNo=1; sources.forEach { uri -> val temp=java.io.File.createTempFile("cv-pdf",".pdf",context.cacheDir); context.contentResolver.openInputStream(uri)?.use{input->temp.outputStream().use{input.copyTo(it)}}; val fd=ParcelFileDescriptor.open(temp,ParcelFileDescriptor.MODE_READ_ONLY); val renderer=PdfRenderer(fd); for(i in 0 until renderer.pageCount){val src=renderer.openPage(i); val page=doc.startPage(PdfDocument.PageInfo.Builder(src.width.coerceAtLeast(595),src.height.coerceAtLeast(842),pageNo++).create()); val bitmap=android.graphics.Bitmap.createBitmap(src.width,src.height,android.graphics.Bitmap.Config.ARGB_8888); src.render(bitmap,null,null,PdfRenderer.Page.RENDER_MODE_FOR_PRINT); page.canvas.drawBitmap(bitmap,0f,0f,Paint(Paint.ANTI_ALIAS_FLAG)); doc.finishPage(page); bitmap.recycle();src.close()};renderer.close();fd.close();temp.delete()};context.contentResolver.openOutputStream(output)?.use{doc.writeTo(it)};doc.close() }

private fun writeImagesPdf(context: Context, imageUris: List<Uri>, outputUri: Uri) { val doc=PdfDocument(); imageUris.forEachIndexed { index, uri -> val bitmap=context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it) } ?: return@forEachIndexed; val page=doc.startPage(PdfDocument.PageInfo.Builder(595,842,index+1).create()); val scale=minOf(555f/bitmap.width,782f/bitmap.height); val w=bitmap.width*scale; val h=bitmap.height*scale; page.canvas.drawBitmap(bitmap,null,android.graphics.RectF((595f-w)/2f,(842f-h)/2f,(595f+w)/2f,(842f+h)/2f),Paint(Paint.ANTI_ALIAS_FLAG)); doc.finishPage(page); bitmap.recycle() }; context.contentResolver.openOutputStream(outputUri)?.use{doc.writeTo(it)}; doc.close() }
private fun writeImagePdf(context: Context, imageUri: Uri, outputUri: Uri) = writeImagesPdf(context,listOf(imageUri),outputUri)

private fun writeCvPdf(context: Context, uri: Uri, name:String, title:String, email:String, city:String, summary:String, experience:String, education:String, skills:String, template:String) {
    val doc=PdfDocument(); val page=doc.startPage(PdfDocument.PageInfo.Builder(595,842,1).create()); val c=page.canvas; val p=Paint(Paint.ANTI_ALIAS_FLAG)
    val accent=if(template=="Latitude") android.graphics.Color.rgb(47,110,79) else android.graphics.Color.rgb(178,58,46)
    if(template=="Latitude"){p.color=android.graphics.Color.rgb(239,242,236);c.drawRect(0f,0f,155f,842f,p)}
    if(template=="Moderne"){p.color=android.graphics.Color.rgb(31,36,33);c.drawRect(0f,0f,595f,125f,p)}
    var x=if(template=="Latitude") 180f else 42f; var y=if(template=="Moderne") 58f else 62f
    p.color=if(template=="Moderne") android.graphics.Color.WHITE else android.graphics.Color.rgb(25,25,25);p.textSize=27f;p.typeface=android.graphics.Typeface.DEFAULT_BOLD;c.drawText(name.ifBlank{"Mon CV"},x,y,p)
    y+=28;p.textSize=14f;p.color=accent;p.typeface=android.graphics.Typeface.DEFAULT_BOLD;c.drawText(title,x,y,p);y+=22;p.textSize=10f;p.color=android.graphics.Color.DKGRAY;c.drawText(listOf(email,city).filter{it.isNotBlank()}.joinToString("  •  "),x,y,p);y+=38
    val sections=listOf("PROFIL" to summary,"EXPÉRIENCE" to experience,"FORMATION" to education,"COMPÉTENCES" to skills)
    sections.forEach{(head,text)->if(text.isNotBlank()){p.color=accent;p.textSize=12f;p.typeface=android.graphics.Typeface.DEFAULT_BOLD;c.drawText(head,x,y,p);y+=19;p.color=android.graphics.Color.DKGRAY;p.textSize=11f;p.typeface=android.graphics.Typeface.DEFAULT;text.chunked(78).forEach{if(y<810f){c.drawText(it,x,y,p);y+=16}};y+=17}}
    if(template=="Latitude"){p.color=android.graphics.Color.DKGRAY;p.textSize=10f;p.typeface=android.graphics.Typeface.DEFAULT_BOLD;c.drawText("STYLE",35f,55f,p);p.typeface=android.graphics.Typeface.DEFAULT;c.drawText(template,35f,72f,p)}
    doc.finishPage(page);context.contentResolver.openOutputStream(uri)?.use{doc.writeTo(it)};doc.close()
}
@Composable private fun FeatureCard(icon:androidx.compose.ui.graphics.vector.ImageVector,title:String,body:String){Card(Modifier.fillMaxWidth().animateContentSize(),shape=RoundedCornerShape(22.dp)){Row(Modifier.padding(18.dp),verticalAlignment=Alignment.CenterVertically){Icon(icon,null,tint=Red);Spacer(Modifier.width(16.dp));Column{Text(title,fontWeight=FontWeight.Bold);Text(body,color=MaterialTheme.colorScheme.onSurfaceVariant)}}}}
