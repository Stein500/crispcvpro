package com.crispcv.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
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

@Composable
fun CrispCVApp() {
    val nav = rememberNavController()
    Scaffold(bottomBar = { NavigationBar { val route = nav.currentBackStackEntryAsState().value?.destination?.route
        NavigationBarItem(route == "home", { nav.navigate("home") }, { Icon(Icons.Default.Home, null) }, label={Text("Accueil")})
        NavigationBarItem(route == "studio", { nav.navigate("studio") }, { Icon(Icons.Default.Description, null) }, label={Text("Mes CV")})
        NavigationBarItem(route == "guides", { nav.navigate("guides") }, { Icon(Icons.Default.MenuBook, null) }, label={Text("Guides")})
    }}) { pad -> NavHost(nav, "home", Modifier.padding(pad)) {
        composable("home") { HomeScreen { nav.navigate("studio") } }
        composable("studio") { StudioScreen() }
        composable("guides") { GuidesScreen() }
    } }
}

@Composable private fun HomeScreen(openStudio: () -> Unit) { LazyColumn(Modifier.fillMaxSize().padding(24.dp), verticalArrangement=Arrangement.spacedBy(20.dp)) {
    item { Spacer(Modifier.height(20.dp)); Text("CrispCV", style=MaterialTheme.typography.labelLarge, color=MaterialTheme.colorScheme.primary); Text("Un CV net.\nLe bon format.", style=MaterialTheme.typography.displaySmall, fontWeight=FontWeight.Bold); Text("Votre candidature, créée localement sur votre téléphone. Sans compte, sans filigrane, sans piège.", style=MaterialTheme.typography.bodyLarge) }
    item { Button(openStudio, Modifier.fillMaxWidth().height(54.dp)) { Icon(Icons.Default.Add, null); Spacer(Modifier.width(8.dp)); Text("Créer mon CV") } }
    item { Text("Tout ce dont vous avez besoin", style=MaterialTheme.typography.titleLarge, fontWeight=FontWeight.Bold) }
    item { FeatureCard(Icons.Default.Lock, "Confidentiel par défaut", "Vos données restent sur votre appareil.") }
    item { FeatureCard(Icons.Default.PictureAsPdf, "PDF professionnel", "Export prêt à envoyer, même hors connexion.") }
    item { FeatureCard(Icons.Default.AutoAwesome, "Des modèles qui vous ressemblent", "Une mise en page claire, lisible et moderne.") }
} }

@Composable private fun StudioScreen() { var show by remember { mutableStateOf(false) }; LazyColumn(Modifier.fillMaxSize().padding(24.dp), verticalArrangement=Arrangement.spacedBy(16.dp)) {
    item { Text("Mes CV", style=MaterialTheme.typography.headlineMedium, fontWeight=FontWeight.Bold); Text("Tout est enregistré sur ce téléphone.", color=MaterialTheme.colorScheme.onSurfaceVariant) }
    item { Card(Modifier.fillMaxWidth(), colors=CardDefaults.cardColors(containerColor=MaterialTheme.colorScheme.primaryContainer)) { Column(Modifier.padding(20.dp)) { Text("Votre premier CV", style=MaterialTheme.typography.titleLarge, fontWeight=FontWeight.Bold); Text("Commencez par vos coordonnées et votre expérience."); Button({ show=true }, Modifier.padding(top=14.dp)) { Text("Commencer") } } } }
    if(show) item { OutlinedTextField("", { }, label={Text("Votre nom complet")}, modifier=Modifier.fillMaxWidth()) }
} }

@Composable private fun GuidesScreen() { LazyColumn(Modifier.fillMaxSize().padding(24.dp), verticalArrangement=Arrangement.spacedBy(14.dp)) { item { Text("Guides utiles", style=MaterialTheme.typography.headlineMedium, fontWeight=FontWeight.Bold) }; items(listOf("Analyse logique des phrases", "Bien rédiger son CV", "Préparer un entretien")) { title -> ListItem({ Text(title, fontWeight=FontWeight.SemiBold) }, leadingContent={ Icon(Icons.Default.MenuBook, null) }) } } }

@Composable private fun FeatureCard(icon: androidx.compose.ui.graphics.vector.ImageVector, title: String, body: String) { Card(Modifier.fillMaxWidth()) { Row(Modifier.padding(18.dp), verticalAlignment=Alignment.CenterVertically) { Icon(icon, null, tint=MaterialTheme.colorScheme.primary); Spacer(Modifier.width(16.dp)); Column { Text(title, fontWeight=FontWeight.Bold); Text(body, color=MaterialTheme.colorScheme.onSurfaceVariant) } } } }
