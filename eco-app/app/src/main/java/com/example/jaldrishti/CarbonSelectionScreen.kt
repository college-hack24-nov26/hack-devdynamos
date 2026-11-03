package com.example.jaldrishti

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CarbonSelectionScreen(navController: NavController) {
    val primaryGreen = Color(0xFF1B5E20)
    val mediumGreen = Color(0xFF2E7D32)
    val lightGreen = Color(0xFFE8F5E9)
    val white = Color.White
    val orange = Color(0xFFFF6D00)

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { navController.navigate("AIAssistant") },
                containerColor = orange,
                contentColor = Color.White,
                icon = { Icon(Icons.Default.SmartToy, contentDescription = "AI") },
                text = { Text("Ask AI", fontWeight = FontWeight.Bold) }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            white,
                            Color(0xFFE8F5E9)
                        )
                    )
                )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Top
            ) {
                Spacer(Modifier.height(40.dp))

                // App Logo and Title
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(vertical = 20.dp)
                ) {
                    Text(
                        text = "Carbon Setu",
                        fontSize = 42.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = primaryGreen,
                        letterSpacing = 1.sp
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        text = "Bridging Farmers to Carbon Markets",
                        fontSize = 15.sp,
                        color = mediumGreen.copy(alpha = 0.75f),
                        fontWeight = FontWeight.Medium
                    )
                }

                Spacer(Modifier.height(20.dp))

                // Carbon Type Selection Cards - Only Green Carbon
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    // Green Carbon Card - Direct to Boundary Marking
                    CarbonTypeCard(
                        title = "Green Carbon",
                        description = "Register your land and track carbon credits from forests, agriculture, and terrestrial ecosystems",
                        icon = Icons.Default.Forest,
                        backgroundColor = lightGreen,
                        iconColor = primaryGreen,
                        borderColor = primaryGreen,
                        onClick = {
                            navController.navigate("BoundaryMarking")
                        }
                    )
                }

                Spacer(Modifier.height(24.dp))

                // Hero image - tree on coins
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(220.dp),
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(6.dp)
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.carbon_setu_hero),
                        contentDescription = "Carbon Setu - Green Future",
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(RoundedCornerShape(20.dp)),
                        contentScale = ContentScale.Crop
                    )
                }

                Spacer(Modifier.height(24.dp))

                // Footer
                Text(
                    text = "Start your green carbon journey today",
                    fontSize = 14.sp,
                    color = mediumGreen.copy(alpha = 0.6f),
                    modifier = Modifier.padding(bottom = 20.dp)
                )
            }
        }
    }
}

@Composable
fun CarbonTypeCard(
    title: String,
    description: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    backgroundColor: Color,
    iconColor: Color,
    borderColor: Color,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(180.dp)
            .padding(horizontal = 4.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        elevation = CardDefaults.cardElevation(4.dp),
        onClick = onClick
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = iconColor,
                    modifier = Modifier.size(48.dp)
                )
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = "Navigate",
                    tint = iconColor,
                    modifier = Modifier.size(28.dp)
                )
            }

            Column {
                Text(
                    text = title,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = iconColor
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    text = description,
                    fontSize = 14.sp,
                    color = iconColor.copy(alpha = 0.7f),
                    lineHeight = 20.sp
                )
            }
        }
    }
}
