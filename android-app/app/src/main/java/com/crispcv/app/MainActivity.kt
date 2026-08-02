package com.crispcv.app

import android.content.Context
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.os.Bundle
import java.io.FileOutputStream
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
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
    Scaffold(bottomBar = { NavigationBar { listOf("home" to Icons.Default.Home, "studio" to Icons.Default.Description, "guides" to Icons.AutoMirrored.Filled.MenuBook, "convert" to Icons.Default.SwapHoriz).forEach { (r, icon) -> NavigationBarItem(route==r, { nav.navigate(r) { launchSingleTop=true } }, { Icon(icon, null) }, label={Text(mapOf("home" to "Accueil", "studio" to "Mes CV", "guides" to "Guides", "convert" to "Convertir")[r]!!)}) } }}) { pad ->
        NavHost(nav, "home", Modifier.padding(pad)) { composable("home") { HomeScreen { nav.navigate("studio") } }; composable("studio") { StudioScreen() }; composable("guides") { GuidesScreen() }; composable("convert") { ConverterScreen() } }
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
    var name by remember { mutableStateOf(prefs.getString("name","") ?: "") }; var title by remember { mutableStateOf(prefs.getString("title","") ?: "") }; var email by remember { mutableStateOf(prefs.getString("email","") ?: "") }; var city by remember { mutableStateOf(prefs.getString("city","") ?: "") }; var summary by remember { mutableStateOf(prefs.getString("summary","") ?: "") }; var experience by remember { mutableStateOf(prefs.getString("experience","") ?: "") }; var education by remember { mutableStateOf(prefs.getString("education","") ?: "") }; var skills by remember { mutableStateOf(prefs.getString("skills","") ?: "") }; var saved by remember { mutableStateOf(false) }
    val save={ prefs.edit().putString("name",name).putString("title",title).putString("email",email).putString("city",city).putString("summary",summary).putString("experience",experience).putString("education",education).putString("skills",skills).apply(); saved=true }
    val create=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/pdf")){ uri -> if(uri!=null) writeCvPdf(context,uri,name,title,email,city,summary,experience,education,skills) }
    LazyColumn(Modifier.fillMaxSize().padding(24.dp), verticalArrangement=Arrangement.spacedBy(14.dp)) {
        item { Text("Mon CV", style=MaterialTheme.typography.headlineMedium, fontWeight=FontWeight.Bold); Text("Tout est enregistré sur ce téléphone.", color=MaterialTheme.colorScheme.onSurfaceVariant) }
        item { SectionTitle("Coordonnées") }; item { Field("Nom complet",name){name=it;saved=false} }; item { Field("Titre professionnel",title){title=it;saved=false} }; item { Field("E-mail",email){email=it;saved=false} }; item { Field("Ville / pays",city){city=it;saved=false} }
        item { SectionTitle("Profil professionnel") }; item { OutlinedTextField(summary,{summary=it;saved=false},label={Text("Votre résumé en 3 à 4 lignes")},modifier=Modifier.fillMaxWidth(),minLines=4) }
        item { Row(horizontalArrangement=Arrangement.spacedBy(10.dp),modifier=Modifier.fillMaxWidth()){ Button(save,Modifier.weight(1f)){Icon(Icons.Default.Save,null);Spacer(Modifier.width(6.dp));Text(if(saved)"Enregistré" else "Sauvegarder")}; OutlinedButton({create.launch("CV-${name.ifBlank{"CrispCV"}}.pdf")},Modifier.weight(1f)){Icon(Icons.Default.PictureAsPdf,null);Spacer(Modifier.width(6.dp));Text("Exporter PDF")} } }
        item { SectionTitle("Expérience professionnelle") }; item { OutlinedTextField(experience,{experience=it;saved=false},label={Text("Poste, organisation, dates et réalisations")},modifier=Modifier.fillMaxWidth(),minLines=4) }; item { SectionTitle("Formation") }; item { Field("Diplôme et établissement",education){education=it;saved=false} }; item { SectionTitle("Compétences") }; item { OutlinedTextField(skills,{skills=it;saved=false},label={Text("Ex. Excel, vente, communication…")},modifier=Modifier.fillMaxWidth(),minLines=2) }
    }
}
@Composable private fun Field(label:String,value:String,onChange:(String)->Unit)=OutlinedTextField(value,onChange,label={Text(label)},modifier=Modifier.fillMaxWidth(),singleLine=true)
@Composable private fun SectionTitle(text:String)=Text(text,style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold,modifier=Modifier.padding(top=8.dp))

@Composable private fun GuidesScreen() { var selected by remember { mutableStateOf<String?>(null) }; val guide=selected; if(guide!=null) { LazyColumn(Modifier.fillMaxSize().padding(24.dp), verticalArrangement=Arrangement.spacedBy(14.dp)) { item { Text(guide,style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold); Text("Leçon CrispCV",color=Red) }; item { Text(if(guide.startsWith("Analyse")) "Repérez les verbes conjugués, délimitez les propositions, puis identifiez leur nature et leur rôle. Une proposition indépendante ne dépend d'aucune autre. La principale commande une subordonnée. La relative complète un antécédent avec qui, que, dont ou où." else "Une ressource pratique CrispCV pour préparer votre candidature efficacement.",style=MaterialTheme.typography.bodyLarge); Button({selected=null}) { Text("Retour aux guides") } } } } else LazyColumn(Modifier.fillMaxSize().padding(24.dp),verticalArrangement=Arrangement.spacedBy(14.dp)) { item { Text("Guides utiles",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold) }; items(listOf("Analyse logique des phrases","Bien rédiger son CV","Préparer un entretien")) { title -> Card({selected=title},Modifier.fillMaxWidth()) { ListItem({Text(title,fontWeight=FontWeight.SemiBold)},leadingContent={Icon(Icons.AutoMirrored.Filled.MenuBook,null)}) } } } }
}

@Composable private fun ConverterScreen() { var uri by remember { mutableStateOf<Uri?>(null) }; var message by remember { mutableStateOf("Choisissez un fichier sur votre téléphone") }; val picker=rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()){ u->uri=u; if(u!=null) message="Fichier sélectionné : ${u.lastPathSegment ?: "document"}" }; LazyColumn(Modifier.fillMaxSize().padding(24.dp),verticalArrangement=Arrangement.spacedBy(16.dp)) { item { Text("Convertisseur",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold); Text("Vos fichiers restent sur votre appareil.",color=MaterialTheme.colorScheme.onSurfaceVariant) }; item { Card(Modifier.fillMaxWidth(),colors=CardDefaults.cardColors(containerColor=Soft)) { Column(Modifier.padding(22.dp),horizontalAlignment=Alignment.CenterHorizontally) { Icon(Icons.Default.UploadFile,null,tint=Red,modifier=Modifier.size(48.dp)); Text("PDF, images et documents",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold); Text(message); Button({picker.launch(arrayOf("application/pdf","image/*","text/plain","application/vnd.openxmlformats-officedocument.wordprocessingml.document"))},Modifier.padding(top=12.dp)){Text("Choisir un fichier")} } } }; item { FeatureCard(Icons.Default.PictureAsPdf,"Image vers PDF","Sélectionnez une image puis créez un PDF localement.") }; item { FeatureCard(Icons.Default.Compress,"Compresser un PDF","Outil local disponible dans la prochaine version.") }; item { if(uri!=null) Button({ message="Prêt à traiter localement" },Modifier.fillMaxWidth()){Text("Préparer la conversion") } } } }

private fun writeCvPdf(context: Context, uri: Uri, name:String, title:String, email:String, city:String, summary:String, experience:String, education:String, skills:String) {
    val doc=PdfDocument(); val page=doc.startPage(PdfDocument.PageInfo.Builder(595,842,1).create()); val c=page.canvas; val p=Paint(Paint.ANTI_ALIAS_FLAG); p.color=android.graphics.Color.rgb(178,58,46); p.textSize=28f; p.typeface=android.graphics.Typeface.DEFAULT_BOLD; c.drawText(name.ifBlank{"Mon CV"},40f,65f,p); p.color=android.graphics.Color.DKGRAY; p.textSize=15f; c.drawText(title,40f,95f,p); p.textSize=11f; c.drawText(listOf(email,city).filter{it.isNotBlank()}.joinToString("  •  "),40f,120f,p); p.textSize=13f; var y=170f; listOf("PROFIL" to summary,"EXPÉRIENCE" to experience,"FORMATION" to education,"COMPÉTENCES" to skills).forEach{(head,text)-> if(text.isNotBlank()){p.color=android.graphics.Color.rgb(178,58,46);p.typeface=android.graphics.Typeface.DEFAULT_BOLD;c.drawText(head,40f,y,p);y+=22;p.color=android.graphics.Color.DKGRAY;p.typeface=android.graphics.Typeface.DEFAULT; text.chunked(85).forEach{c.drawText(it,40f,y,p);y+=18};y+=18}}; doc.finishPage(page); context.contentResolver.openOutputStream(uri)?.use{doc.writeTo(it)}; doc.close()
}

@Composable private fun FeatureCard(icon:androidx.compose.ui.graphics.vector.ImageVector,title:String,body:String){Card(Modifier.fillMaxWidth()){Row(Modifier.padding(18.dp),verticalAlignment=Alignment.CenterVertically){Icon(icon,null,tint=Red);Spacer(Modifier.width(16.dp));Column{Text(title,fontWeight=FontWeight.Bold);Text(body,color=MaterialTheme.colorScheme.onSurfaceVariant)}}}}
