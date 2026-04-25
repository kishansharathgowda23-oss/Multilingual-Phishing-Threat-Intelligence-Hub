package com.shildex.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class HistoryActivity : ComponentActivity() {
    private val apiService by lazy {
        Retrofit.Builder()
            .baseUrl("http://10.0.2.2:5000/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        fetchHistory()
        setContent {
            ShildexTheme {
                HistoryScreen(onBack = { finish() })
            }
        }
    }

    private var historyItems by mutableStateOf<List<HistoryItem>>(emptyList())
    private var isLoading by mutableStateOf(false)

    private fun fetchHistory() {
        lifecycleScope.launch {
            isLoading = true
            try {
                val response = apiService.getHistory()
                historyItems = response.history
            } catch (e: Exception) {
                // Handle error
            } finally {
                isLoading = false
            }
        }
    }

    @OptIn(ExperimentalMaterial3Api::class)
    @Composable
    fun HistoryScreen(onBack: () -> Unit) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Recent Scans (Task List)") },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color(0xFF1976D2),
                        titleContentColor = Color.White,
                        navigationIconContentColor = Color.White
                    )
                )
            }
        ) { padding ->
            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else if (historyItems.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.History,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = Color.LightGray
                        )
                        Text("No scan history found", color = Color.Gray, modifier = Modifier.padding(top = 16.dp))
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .padding(padding)
                        .fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(historyItems) { item ->
                        HistoryCard(item)
                    }
                }
            }
        }
    }

    @Composable
    fun HistoryCard(item: HistoryItem) {
        val statusColor = when (item.status) {
            "Safe" -> Color(0xFF4CAF50)
            "Spam" -> Color(0xFFFF9800)
            "Suspicious" -> Color(0xFFF44336)
            else -> Color.Gray
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(12.dp)
                                .background(statusColor, CircleShape)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            item.status.uppercase(),
                            fontWeight = FontWeight.Bold,
                            color = statusColor,
                            fontSize = 14.sp
                        )
                    }
                    Text(
                        "${item.confidence}% Confidence",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = item.content,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium
                )

                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Risk: ${item.risk}",
                        fontSize = 12.sp,
                        color = if (item.risk == "High") Color.Red else Color.Gray,
                        fontWeight = if (item.risk == "High") FontWeight.Bold else FontWeight.Normal
                    )
                    Text(
                        item.timestamp.split("T").firstOrNull() ?: "",
                        fontSize = 11.sp,
                        color = Color.LightGray
                    )
                }
            }
        }
    }
}
